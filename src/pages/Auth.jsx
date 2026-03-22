import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FaGoogle } from "react-icons/fa";
import { HiOutlineEye, HiOutlineEyeOff, HiCheckCircle } from "react-icons/hi";

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [verificationMode, setVerificationMode] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [verificationError, setVerificationError] = useState("");
    const navigate = useNavigate();

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/profile");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendEmailOTP = async (email, name) => {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setLoading(true);
        try {
            const res = await fetch("/.netlify/functions/sendVerificationOTP", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: newOtp, customerName: name }),
            });
            if (!res.ok) throw new Error("Could not send verification email.");
            setVerificationMode(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (otp === generatedOtp) {
            setLoading(true);
            try {
                const user = auth.currentUser;
                await setDoc(doc(db, "users", user.uid), {
                    emailVerified: true
                }, { merge: true });
                alert("Account verified successfully!");
                navigate("/profile");
            } catch (err) {
                setVerificationError("Verification failed.");
            } finally {
                setLoading(false);
            }
        } else {
            setVerificationError("Invalid code. Please check your email.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                navigate("/profile");
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // Save additional info to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    role: "customer",
                    uid: user.uid,
                    emailVerified: false,
                    createdAt: new Date()
                });

                // Send Custom Email OTP
                await handleSendEmailOTP(formData.email, formData.name);
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace("Firebase: ", ""));
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Check if user already exists to preserve role
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    name: user.displayName,
                    email: user.email,
                    phone: user.phoneNumber || "",
                    role: "customer",
                    uid: user.uid,
                    emailVerified: true,
                    createdAt: new Date()
                });
            } else {
                // If exists, only sync basic profile details but PROTECT THE ROLE
                await setDoc(userDocRef, {
                    name: user.displayName,
                    email: user.email,
                    uid: user.uid
                }, { merge: true });
            }
            navigate("/profile");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-white pt-32">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block mb-3">Membership</span>
                    <h1 className="text-4xl font-serif text-gray-900 tracking-tighter mb-3">
                        {verificationMode ? "Verify Email" : isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-gray-500 text-xs italic font-serif">
                        {verificationMode ? `Verification code sent to ${formData.email}` : isLogin ? "Continue where you left off." : "Start your natural care journey."}
                    </p>
                </div>

                <div className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest text-center rounded-none">
                            {error}
                        </div>
                    )}

                    {!verificationMode ? (
                        <>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <>
                                        <div className="space-y-2 border-b border-gray-100 pb-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2 border-b border-gray-100 pb-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                name="phone"
                                                placeholder="Mobile Number"
                                                className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="space-y-2 border-b border-gray-100 pb-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2 border-b border-gray-100 pb-2 relative">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 pr-10"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                                        >
                                            {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {isLogin && (
                                    <div className="flex justify-start pt-1">
                                        <Link 
                                            to="/forget-password" 
                                            className="px-4 py-2 border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                )}

                                <button
                                    disabled={loading}
                                    className="w-full bg-gray-900 text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-admin-primary transition-all shadow-none disabled:opacity-50 rounded-none"
                                >
                                    {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
                                </button>
                            </form>

                            {isLogin && (
                                <>
                                    <div className="relative text-center">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-100"></div>
                                        </div>
                                        <span className="relative px-4 bg-white text-[11px] text-gray-300 font-bold uppercase tracking-widest">Or</span>
                                    </div>

                                    <button
                                        onClick={handleGoogleSignIn}
                                        className="w-full flex items-center justify-center gap-4 border border-gray-100 py-5 hover:bg-gray-50 transition-all font-bold text-xs uppercase tracking-widest rounded-none"
                                    >
                                        <FaGoogle size={14} /> Continue with Google
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                            <div className="p-10 border border-gray-100 bg-gray-50/50 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Verify Your Code</h3>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                                        Enter the 6-digit code sent to your inbox to activate your account.
                                        <br/>
                                        <span className="text-[9px] lowercase italic mt-1 block">(Check your spam folder if you don't see it)</span>
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <input
                                        type="text"
                                        placeholder="0 0 0 0 0 0"
                                        className="w-full bg-white border border-gray-100 py-6 text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:border-admin-primary transition-colors"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        maxLength={6}
                                    />
                                    {verificationError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">{verificationError}</p>}
                                    <button
                                        onClick={handleVerifyEmail}
                                        disabled={loading || otp.length < 6}
                                        className="w-full bg-gray-900 text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-admin-primary transition-all disabled:opacity-50"
                                    >
                                        {loading ? "Verifying..." : "Confirm Code"}
                                    </button>
                                     <button 
                                        onClick={() => handleSendEmailOTP(formData.email, formData.name)}
                                        className="w-full text-[9px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 py-3 hover:bg-gray-50 transition-all font-sans"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>

                             <div className="text-center pt-4">
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="w-full text-[10px] font-bold uppercase tracking-widest text-gray-400 py-4 border border-gray-100 hover:border-black hover:text-black transition-all"
                                >
                                    Verify Later
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-8 text-center text-gray-100 h-0 overflow-hidden">
                        <div id="recaptcha-container"></div>
                    </div>

                    <div className="pt-8 text-center">
                         <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setVerificationMode(false);
                            }}
                            className="w-full bg-gray-50 text-gray-500 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all rounded-none border border-gray-100"
                        >
                            {isLogin ? "No account? Start Membership" : "Have an account? Access Account"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
