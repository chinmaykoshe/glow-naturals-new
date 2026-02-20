import React from "react";

function Privacy() {
    return (
        <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="space-y-4">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Legal Information</span>
                    <h1 className="text-6xl font-serif text-gray-900 tracking-tighter leading-none">Privacy Policy</h1>
                </div>

                <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed font-serif italic text-lg border-t border-gray-100 pt-12">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900 not-italic">1. Information We Collect</h2>
                        <p>
                            At Glow Naturals, we value your privacy. We collect only what is needed for your shopping experience: your name, email, shipping address, and phone number to ensure your orders reach you safely.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900 not-italic">2. How We Use It</h2>
                        <p>
                            Your information is used only to personalize your experience, process your orders, and keep you informed about our latest products. We do not sell your data to any third parties.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900 not-italic">3. Protection & Security</h2>
                        <p>
                            We use industry-standard security to protect your information. Your connection to our website is secured through SSL protocols, ensuring your data is private and protected.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900 not-italic">4. Your Rights</h2>
                        <p>
                            You have full control over your data. At any time, you may request to view, update, or delete your personal information from our systems through your profile settings or by contacting our support team.
                        </p>
                    </section>

                    <section className="space-y-6 border-t border-gray-100 pt-8">
                        <p className="text-sm text-gray-400 font-sans uppercase tracking-widest not-italic">
                            Last Updated: February 2026
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default Privacy;
