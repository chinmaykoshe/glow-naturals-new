import React from "react";
import { Link } from "react-router-dom";
import { RiInstagramLine, RiTwitterLine, RiFacebookFill, RiPinterestLine } from "react-icons/ri";
import { HiOutlineArrowRight } from "react-icons/hi";

function Footer() {
    return (
        <footer className="bg-[#1a1816] text-[#e5e1da] pt-32 pb-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    {/* Brand Column */}
                    <div className="space-y-8 md:col-span-1 lg:col-span-1">
                        <img src="/glownaturalslogo.png" alt="Glow Naturals" className="h-10 w-auto brightness-0 invert opacity-80" />
                        <p className="text-xs font-medium text-[#8d8a86] leading-relaxed max-w-xs">
                            Purveyors of organic natural care, crafted for your routine with pure plant extracts.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-8 flex flex-col items-start lg:items-center">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#5d5a56] mb-8">Shop</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link to="/shop" className="hover:text-admin-primary transition">All Products</Link></li>
                                <li><Link to="/best-sellers" className="hover:text-admin-primary transition">Best Sellers</Link></li>
                                <li><Link to="/new-arrivals" className="hover:text-admin-primary transition">New Arrivals</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-8 flex flex-col items-start lg:items-center">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#5d5a56] mb-8">Support</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link to="/about" className="hover:text-admin-primary transition">Our Story</Link></li>
                                <li><Link to="/contact" className="hover:text-admin-primary transition">Contact</Link></li>
                                <li><Link to="/profile" className="hover:text-admin-primary transition">My Account</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Social Connect */}
                    <div className="space-y-8 flex flex-col items-start lg:items-end">
                        <div className="text-left lg:text-right">
                            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#5d5a56] mb-8">Connect</h4>
                            <div className="flex gap-4 lg:justify-end">
                                <a href="#" className="w-12 h-12 border border-[#3d3a36] flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                    <RiInstagramLine size={20} />
                                </a>
                                <a href="#" className="w-12 h-12 border border-[#3d3a36] flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                    <RiTwitterLine size={20} />
                                </a>
                                <a href="#" className="w-12 h-12 border border-[#3d3a36] flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                    <RiFacebookFill size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-[#3d3a36] flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#5d5a56]">
                        © 2026 Glow Naturals • Crafted for you.
                    </p>
                    <div className="flex gap-8">
                        <Link to="/privacy" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5d5a56] hover:text-[#e5e1da] transition">Privacy</Link>
                        <Link to="/terms" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5d5a56] hover:text-[#e5e1da] transition">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
