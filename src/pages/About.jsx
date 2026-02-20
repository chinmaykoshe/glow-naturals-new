import React from "react";

function About() {
    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32">
            {/* Hero Section - Minimal */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden border-b border-gray-100 px-6">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Background"
                        className="w-full h-full object-cover opacity-10 grayscale"
                    />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Our Heritage</span>
                    <h1 className="text-6xl md:text-8xl font-serif font-medium text-gray-900 leading-tight tracking-tighter">Nurturing Your <br /> Natural Radiance</h1>
                    <p className="text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
                        We believe that true beauty is an extension of nature. Since 2020, we've been
                        harvesting the purest plants to create routines that honor your skin and the earth.
                    </p>
                </div>
            </section>

            {/* Story Section - Minimalist */}
            <section className="py-32 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    <div className="relative">
                        <div className="aspect-[4/5] overflow-hidden bg-gray-50 border border-gray-100">
                            <img
                                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Natural ingredients"
                                className="w-full h-full object-cover grayscale-[0.2] transition-all duration-1000"
                            />
                        </div>
                        {/* Minimal geometric accent */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 border-t border-r border-gray-200 hidden lg:block" />
                    </div>

                    <div className="space-y-12">
                        <h2 className="text-4xl md:text-6xl font-serif font-medium text-gray-900 tracking-tighter">The Natural <br /> Philosophy</h2>
                        <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                            <p>
                                Our founder, inspired by the ancient beauty routines of the Indian subcontinent,
                                embarked on a journey to rediscover the power of raw plant extracts. We realized
                                that the most profound care isn't made in a lab, but grown in soil.
                            </p>
                            <p>
                                Every drop of Glow Naturals is a result of careful extraction processes that
                                preserve the quality of our ingredients, ensuring your skin receives
                                the full benefit of nature's wisdom.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-100">
                            <div>
                                <h4 className="text-gray-900 font-serif text-3xl mb-2">100%</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Organic Sourcing</p>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-serif text-3xl mb-2">Pure</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Natural Quality</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default About;
