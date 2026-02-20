import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function AdminHero() {
    const [hero, setHero] = useState({
        bgImage: '',
        title: '',
        subtitle: '',
        buttonLabel: '',
        buttonHref: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHero();
    }, []);

    const fetchHero = async () => {
        const docRef = doc(db, "settings", "hero");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setHero(docSnap.data());
        }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, "settings", "hero"), hero);
            alert("Hero section updated successfully.");
        } catch (error) {
            console.error("Error updating hero:", error);
        }
    };

    return (
        <div className="space-y-12">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Aura</span>
                <h1 className="text-5xl font-serif text-gray-900 tracking-tighter">Hero Section</h1>
            </div>

            <form onSubmit={handleSave} className="bg-white p-16 border border-gray-100 space-y-12 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Headline (H1)</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-transparent py-2 text-2xl font-serif text-gray-900 focus:outline-none"
                            value={hero.title}
                            onChange={(e) => setHero({ ...hero, title: e.target.value })}
                            placeholder="Pure Botanical Luxury"
                        />
                    </div>
                    <div className="space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Background Image URL</label>
                        <input
                            required
                            type="url"
                            className="w-full bg-transparent py-2 text-sm text-gray-900 focus:outline-none"
                            value={hero.bgImage}
                            onChange={(e) => setHero({ ...hero, bgImage: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                        />
                    </div>
                    <div className="col-span-2 space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description (P)</label>
                        <textarea
                            required
                            rows="3"
                            className="w-full bg-transparent py-2 text-sm text-gray-500 leading-relaxed focus:outline-none resize-none"
                            value={hero.subtitle}
                            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                            placeholder="Experience the sacred science of nature..."
                        />
                    </div>
                    <div className="space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CTA Button Text</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-transparent py-2 text-sm font-bold uppercase tracking-widest text-gray-900 focus:outline-none"
                            value={hero.buttonLabel}
                            onChange={(e) => setHero({ ...hero, buttonLabel: e.target.value })}
                            placeholder="Explore Collection"
                        />
                    </div>
                    <div className="space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CTA Button Redirect (URL/Path)</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-transparent py-2 text-sm text-gray-900 focus:outline-none"
                            value={hero.buttonHref}
                            onChange={(e) => setHero({ ...hero, buttonHref: e.target.value })}
                            placeholder="/shop"
                        />
                    </div>
                </div>

                <div>
                    <button type="submit" className="bg-admin-primary text-white px-20 py-5 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-gray-900 transition-all shadow-lg">
                        Update Galactic Experience
                    </button>
                </div>
            </form>

            {hero.bgImage && (
                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atmosphere Preview</p>
                    <div className="aspect-[21/9] w-full bg-gray-100 overflow-hidden border border-gray-100">
                        <img src={hero.bgImage} className="w-full h-full object-cover" alt="" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminHero;
