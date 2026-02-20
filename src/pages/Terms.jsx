import React from "react";

function Terms() {
    return (
        <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="space-y-4">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Service Guidelines</span>
                    <h1 className="text-6xl font-serif text-gray-900 tracking-tighter leading-none">Terms of Service</h1>
                </div>

                <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed font-serif italic text-lg border-t border-gray-100 pt-12">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900 not-italic">1. Using Our Website</h2>
                        <p>
                            By using Glow Naturals, you agree to follow our simple rules. All products bought here are for personal use only and should not be resold without our permission.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900 not-italic">2. Natural Quality</h2>
                        <p>
                            While we try our best for accuracy, our products are made by hand from nature. Small changes in smell, color, and texture are signs of their natural quality and are not defects.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900 not-italic">3. Exchange Policy</h2>
                        <p>
                            If a product does not suit your skin, you can ask for an exchange within 7 days of delivery. Because our products are pure, they must be returned in their original, sealed box.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900 not-italic">4. Content Rights</h2>
                        <p>
                            All photos and product descriptions on this website belong to Glow Naturals. Please do not copy or use them without asking us first.
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

export default Terms;
