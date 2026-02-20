import React, { useState } from "react";
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Contact() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        message: ""
    });
    const [status, setStatus] = useState("idle");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        try {
            await addDoc(collection(db, "contacts"), {
                ...formData,
                createdAt: serverTimestamp()
            });
            alert("Your message has been received. We will be in touch shortly.");
            setFormData({ firstName: "", lastName: "", email: "", message: "" });
            setStatus("idle");
        } catch (error) {
            console.error("Error saving contact:", error);
            setStatus("idle");
        }
    };

    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32">
            <section className="py-32 px-6 md:px-12 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-24 px-4">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Inquiry</span>
                        <h1 className="text-6xl font-serif text-gray-900 tracking-tighter leading-none mb-8">We'd love to <br /> hear from you</h1>
                        <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
                            Whether you have a question about our natural products, your recent order,
                            or just want to share your experience, our team is here to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start px-4">
                        {/* Contact Info - Minimalist */}
                        <div className="lg:col-span-4 space-y-12">
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">Direct Lines</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-gray-400">
                                        <HiOutlinePhone size={20} className="text-gray-900" />
                                        <span className="text-sm font-medium">+91 98765 43210</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-400">
                                        <HiOutlineMail size={20} className="text-gray-900" />
                                        <span className="text-sm font-medium">hello@glownaturals.in</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">Office Studio</h4>
                                <div className="flex items-start gap-4 text-gray-400">
                                    <HiOutlineLocationMarker size={20} className="text-gray-900 mt-1" />
                                    <span className="text-sm font-medium leading-relaxed">
                                        Plot 42, Business Park Road<br />
                                        Bandra West, Mumbai 400050
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form - Minimalist */}
                        <div className="lg:col-span-8">
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-12" onSubmit={handleSubmit}>
                                <div className="space-y-2 border-b border-gray-100 pb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-200"
                                        placeholder="Arjun"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 border-b border-gray-100 pb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-200"
                                        placeholder="Sharma"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2 border-b border-gray-100 pb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-200"
                                        placeholder="arjun@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2 border-b border-gray-100 pb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Message</label>
                                    <textarea
                                        required
                                        rows="4"
                                        className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-200 resize-none"
                                        placeholder="Tell us about your concern..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="md:col-span-2 pt-8">
                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="bg-gray-900 text-white px-16 py-5 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-admin-primary transition-all disabled:opacity-50 rounded-none shadow-none"
                                    >
                                        {status === "loading" ? "Sending..." : "Send Message"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section - Minimal */}
            <section className="py-32 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                    <div className="space-y-4">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Journal</span>
                        <h2 className="text-4xl font-serif text-gray-900 tracking-tighter">Join Our Community</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">Receive tips and news for natural radiance.</p>
                    </div>
                    <form className="flex flex-col sm:flex-row gap-0 border border-gray-200 max-w-xl mx-auto rounded-none" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="flex-1 bg-white px-8 py-5 focus:outline-none text-gray-900 placeholder:text-gray-300 rounded-none"
                        />
                        <button className="bg-gray-900 text-white px-12 py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-admin-primary transition-all rounded-none">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}

export default Contact;
