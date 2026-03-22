import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-6 md:p-12 animate-in slide-in-from-bottom-20 duration-700">
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#1a1816] text-[#e5e1da] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-admin-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
                    
                    <div className="flex-1 space-y-3 relative z-10 text-center md:text-left">
                        <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.4em] block">Cookie Policy</span>
                        <h3 className="text-xl font-serif tracking-tight leading-none text-white">We value your browsing experience.</h3>
                        <p className="text-[11px] text-[#8d8a86] font-medium leading-relaxed max-w-2xl uppercase tracking-widest">
                            We use cookies to enhance your journey on our natural care boutique. By continuing, you agree to our 
                            <Link to="/privacy" className="text-white hover:text-admin-primary transition-colors underline mx-2">Privacy Policy</Link> 
                            and 
                            <Link to="/terms" className="text-white hover:text-admin-primary transition-colors underline mx-2">Terms of Use</Link>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
                        <button 
                            onClick={handleAccept}
                            className="bg-white text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-admin-primary hover:text-white transition-all rounded-none w-full md:w-auto"
                        >
                            Accept All
                        </button>
                        <button 
                            onClick={handleAccept}
                            className="border border-[#3d3a36] text-[#e5e1da] px-12 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all rounded-none w-full md:w-auto"
                        >
                            Essential Only
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CookieConsent;
