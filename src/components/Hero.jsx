import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Hero() {
    const [content, setContent] = useState({
        bgImage: "https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "Pure Natural Care",
        subtitle: "Experience the trusted science of nature. Sustainably harvested plants for your daily routine.",
        buttonLabel: "Explore Collection",
        buttonHref: "/shop",
    });

    useEffect(() => {
        const fetchHero = async () => {
            const docRef = doc(db, "settings", "hero");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setContent(docSnap.data());
            }
        };
        fetchHero();
    }, []);

    const { bgImage, title, subtitle, buttonLabel, buttonHref } = content;
    return (
        <section className="relative w-full min-h-[90vh] flex items-center bg-white pt-24 md:pt-32">
            <div className="absolute inset-0 z-0">
                <div className="absolute right-0 top-0 w-1/3 h-full bg-gray-50 hidden lg:block" />
            </div>

            <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 px-6 md:px-12 py-20 items-center relative z-10">
                {/* Text Content */}
                <div className="lg:col-span-7 space-y-12">
                    <div className="space-y-6">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Established 2020</span>
                        <h1 className="text-6xl md:text-8xl font-serif font-medium text-gray-900 leading-[1] tracking-tighter">
                            {title}
                        </h1>
                        <p className="text-lg text-gray-400 max-w-md leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link
                            to={buttonHref}
                            className="w-full sm:w-auto px-12 py-5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-admin-primary transition-all rounded-none"
                        >
                            {buttonLabel}
                        </Link>
                        <Link
                            to="/about"
                            className="w-full sm:w-auto px-12 py-5 border border-gray-200 text-gray-900 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition-all rounded-none"
                        >
                            Read More
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-12 pt-12 border-t border-gray-100 max-w-lg">
                        <div>
                            <p className="text-2xl font-serif text-gray-900">24k+</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Clients</p>
                        </div>
                        <div>
                            <p className="text-2xl font-serif text-gray-900">100%</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Natural</p>
                        </div>
                        <div>
                            <p className="text-2xl font-serif text-gray-900">4.9/5</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Rating</p>
                        </div>
                    </div>
                </div>

                {/* Hero Image Section */}
                <div className="lg:col-span-5 relative">
                    <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                        <img
                            src={bgImage}
                            alt="Hero botanical"
                            className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                        />
                    </div>
                    {/* Minimal decorative element */}
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 border-l border-b border-gray-200 hidden lg:block" />
                </div>
            </div>
        </section>
    );
}

export default Hero;
