import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMail, HiArrowLeft } from "react-icons/hi";

function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-beige-50">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-pink-50/50 p-8 md:p-12">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-50 rounded-full mb-6 text-pink-700">
                        <HiOutlineMail size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3 font-serif">Forgot Password?</h2>
                    <p className="text-gray-500 text-sm leading-relaxed px-4">
                        {submitted
                            ? "Check your inbox! We've sent a recovery link to your email address."
                            : "No worries, it happens! Enter your email and we'll send you a reset link."}
                    </p>
                </div>

                {!submitted ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-[0.2em] ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-700/20 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <button className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-pink-700 transition-all duration-300 shadow-xl shadow-gray-200">
                            Send Reset Link
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setSubmitted(false)}
                        className="w-full bg-pink-50 text-pink-700 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-pink-100 transition-all"
                    >
                        Try another email
                    </button>
                )}

                <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-pink-700 transition-colors"
                    >
                        <HiArrowLeft />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgetPassword;
