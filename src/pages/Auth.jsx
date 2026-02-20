import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FaGoogle } from "react-icons/fa";

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
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
                    createdAt: new Date()
                });
            }
            navigate("/profile");
        } catch (err) {
            console.error(err);
            setError(err.message.replace("Firebase: ", ""));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                role: "customer",
                uid: user.uid,
                createdAt: new Date()
            }, { merge: true });
            navigate("/profile");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-32 px-4 bg-white pt-40">
            <div className="max-w-md w-full">
                <div className="text-center mb-12">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.5em] block mb-4">Membership</span>
                    <h1 className="text-5xl font-serif text-gray-900 tracking-tighter mb-4">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-gray-500 text-sm italic font-serif">
                        {isLogin ? "Continue where you left off." : "Start your natural care journey."}
                    </p>
                </div>

                <div className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest text-center rounded-none">
                            {error}
                        </div>
                    )}

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
                        <div className="space-y-2 border-b border-gray-100 pb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                            <input
                                required
                                type="password"
                                name="password"
                                className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-admin-primary transition-all shadow-none disabled:opacity-50 rounded-none"
                        >
                            {loading ? "Verifying..." : isLogin ? "Log In" : "Sign Up"}
                        </button>
                    </form>

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

                    <div className="pt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-admin-primary transition border-b border-transparent hover:border-admin-primary pb-1 rounded-none"
                        >
                            {isLogin ? "No account? Sign up" : "Have an account? Log in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;
