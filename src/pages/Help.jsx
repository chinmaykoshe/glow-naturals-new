import React, { useState } from "react";
import { HiOutlineChevronDown, HiOutlineMail, HiOutlineTruck, HiOutlineShieldCheck } from "react-icons/hi";

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex justify-between items-center text-left group"
            >
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900 group-hover:text-admin-primary transition-colors">
                    {question}
                </h3>
                <HiOutlineChevronDown 
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-admin-primary' : ''}`} 
                    size={20} 
                />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-8' : 'max-h-0'}`}>
                <p className="text-sm text-gray-500 font-serif italic leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
};

function Help() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto space-y-24">
                {/* Header */}
                <header className="space-y-4 text-center">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Support Center</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-gray-900 tracking-tighter">How can we help?</h1>
                </header>

                {/* Quick Help Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8 border-t border-gray-100">
                    <div className="p-10 bg-gray-50 space-y-4">
                        <div className="flex justify-center">
                            <HiOutlineTruck className="text-admin-primary w-8 h-8" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">Shipping Info</h4>
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed">Delivery can take up to 7 days and may be slightly delayed during peak times.</p>
                    </div>
                    <div className="p-10 bg-gray-50 space-y-4">
                        <div className="flex justify-center">
                            <HiOutlineShieldCheck className="text-admin-primary w-8 h-8" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">Return Policy</h4>
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed">Products cannot be returned or exchanged. For genuine quality concerns, contact us via your delivery email.</p>
                    </div>
                    <div className="p-10 bg-gray-50 space-y-4">
                        <div className="flex justify-center">
                            <HiOutlineMail className="text-admin-primary w-8 h-8" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">Email Support</h4>
                        <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed">info@glownaturals.com</p>
                    </div>
                </div>

                {/* FAQs */}
                <section className="space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-serif text-gray-900 tracking-tight">Common Concerns</h2>
                        <div className="h-px bg-gray-100 w-full" />
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        <FAQItem 
                            question="Where can I track my order?"
                            answer="You can track your order directly from your profile dashboard. Once your order status changes to 'dispatched', you will find the tracking ID and partner information there."
                        />
                        <FAQItem 
                            question="What are your return & exchange guidelines?"
                            answer="Due to the personal care nature of our products, we do not offer returns or exchanges. We ensure every product sent is 100% genuine and packed with extreme care. If you have a specific concern, please contact us via the email address on your delivery notification for a possible new product replacement."
                        />
                        <FAQItem 
                            question="What payment options do you support?"
                            answer="Our official checkout partner is UPI / GPay. We accept all major UPI applications for a seamless and secure transaction experience."
                        />
                        <FAQItem 
                            question="How do I contact customer care?"
                            answer="Our team is available over email and WhatsApp. For immediate order-related queries, please reply to your order confirmation email."
                        />
                        <FAQItem 
                            question="Are your products safe for sensitive skin?"
                            answer="While our ingredients are strictly natural and chemical-free, we always recommend a patch test for sensitive skin types. Consult the detailed ingredient list on each product page."
                        />
                    </div>
                </section>
                
                {/* Footer Section */}
                <div className="pt-20 text-center space-y-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Still have questions?</p>
                    <a 
                        href="mailto:info@glownaturals.com" 
                        className="inline-block bg-gray-900 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-admin-primary transition-all rounded-none"
                    >
                        Contact Our Team
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Help;
