import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { HiArrowLeft } from "react-icons/hi";

function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError(err.message.replace("Firebase: ", ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-24 px-4 bg-white pt-32">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block mb-3">Security</span>
                    <h1 className="text-4xl font-serif text-gray-900 tracking-tighter mb-3">
                        Reset Password
                    </h1>
                    <p className="text-gray-500 text-xs italic font-serif">
                        {submitted
                            ? "Check your inbox for the recovery link."
                            : "Enter your email to receive a reset link."}
                    </p>
                </div>

                <div className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest text-center rounded-none">
                            {error}
                        </div>
                    )}

                    {!submitted ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-admin-primary transition-all shadow-none disabled:opacity-50 rounded-none"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="p-6 bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-none leading-relaxed">
                                Reset link has been sent to {email}.
                                <br /><br />
                                Please check your inbox.
                                <br />
                                If it doesn’t appear within a few minutes, check your spam or promotions folder.
                            </div>
                        </div>
                    )}

                    <div className="pt-8 text-center border-t border-gray-50">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <HiArrowLeft />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgetPassword;
