import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebase";
import { HiCheckCircle, HiExclamationCircle, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [validCode, setValidCode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const oobCode = searchParams.get("oobCode");

    useEffect(() => {
        if (!oobCode) {
            setMessage({ type: "error", text: "No reset code provided." });
            setLoading(false);
            return;
        }

        verifyPasswordResetCode(auth, oobCode)
            .then((userEmail) => {
                setEmail(userEmail);
                setValidCode(true);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setMessage({ type: "error", text: "Invalid or expired reset link." });
                setLoading(false);
            });
    }, [oobCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (password !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match." });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: "error", text: "Password should be at least 6 characters." });
            return;
        }

        setSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setMessage({ type: "success", text: "Password successfully reset! Redirecting..." });
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setMessage({ type: "error", text: error.message.replace("Firebase: ", "") });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center pt-40">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-24 px-4 bg-white pt-32">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block mb-3">Security</span>
                    <h1 className="text-4xl font-serif text-gray-900 tracking-tighter mb-3">
                        New Password
                    </h1>
                    {email && (
                        <p className="text-gray-500 text-xs italic font-serif">
                            Resetting password for {email}
                        </p>
                    )}
                </div>

                <div className="space-y-8">
                    {message.text && (
                        <div className={`p-4 text-xs font-bold uppercase tracking-widest text-center rounded-none flex items-center justify-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                            }`}>
                            {message.type === "success" ? <HiCheckCircle size={16} /> : <HiExclamationCircle size={16} />}
                            {message.text}
                        </div>
                    )}

                    {validCode ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">New Password</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 pr-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
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

                            <div className="space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 pr-10"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        {showConfirmPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                disabled={submitting}
                                className="w-full bg-gray-900 text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-admin-primary transition-all shadow-none disabled:opacity-50 rounded-none shadow-xl shadow-gray-100"
                            >
                                {submitting ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center pt-8">
                            <Link
                                to="/forget-password"
                                className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition border-b border-transparent hover:border-gray-900 pb-1"
                            >
                                Request a new link
                            </Link>
                        </div>
                    )}

                    <div className="pt-8 text-center border-t border-gray-50">
                        <Link
                            to="/login"
                            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition border-b border-transparent hover:border-gray-900 pb-1"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
