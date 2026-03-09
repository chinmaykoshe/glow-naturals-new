import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { supabase } from '../../supabase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { HiOutlineCloudUpload, HiOutlineCheckCircle } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

function AdminHero() {
    const [hero, setHero] = useState({
        bgImage: '',
        title: '',
        subtitle: '',
        buttonLabel: '',
        buttonHref: ''
    });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchHero();
    }, []);

    const fetchHero = async () => {
        const docRef = doc(db, "settings", "hero");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setHero(docSnap.data());
        }
        setHero(prev => ({
            ...prev,
            bgImage: prev.bgImage || '',
            title: prev.title || '',
            subtitle: prev.subtitle || '',
            buttonLabel: prev.buttonLabel || '',
            buttonHref: prev.buttonHref || ''
        }));
        setLoading(false);
    };

    const deleteSupabaseImage = async (url) => {
        if (!url || !url.includes('supabase.co')) return;
        try {
            // Extract file path from URL
            // Supabase URLs are like: storage/v1/object/public/bucket/path/to/file
            // We need 'hero/filename'
            const parts = url.split('/');
            const fileName = parts[parts.length - 1];
            const filePath = `hero/${fileName}`;

            const { error } = await supabase.storage
                .from('glow-naturals')
                .remove([filePath]);
            if (error) throw error;
            console.log("Deleted old hero image:", filePath);
        } catch (error) {
            console.error("Error deleting hero image from Supabase:", error);
        }
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `hero/${fileName}`;

            const { data, error } = await supabase.storage
                .from('glow-naturals')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('glow-naturals')
                .getPublicUrl(filePath);

            // Delete old hero image if it was a Supabase URL before updating
            if (hero.bgImage && hero.bgImage.includes('supabase.co')) {
                await deleteSupabaseImage(hero.bgImage);
            }

            setHero({ ...hero, bgImage: publicUrl });
            alert("Hero image uploaded successfully!");
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 min-h-[90vh] pb-64">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Aura</span>
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tighter">Hero Section</h1>
            </div>

            <form onSubmit={handleSave} className="bg-white p-6 md:p-16 border border-gray-100 space-y-10 md:space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Headline (H1)</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-transparent py-2 text-xl md:text-2xl font-serif text-gray-900 focus:outline-none"
                            value={hero.title}
                            onChange={(e) => setHero({ ...hero, title: e.target.value })}
                            placeholder="Pure Botanical Luxury"
                        />
                    </div>
                    <div className="space-y-4 border-b border-gray-100 pb-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Background Atmosphere</label>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-48 aspect-video bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                <img
                                    src={hero.bgImage || "https://images.unsplash.com/photo-1557683316-973673baf926"}
                                    className="w-full h-full object-cover grayscale opacity-80"
                                    alt="Preview"
                                    onError={(e) => e.target.src = "https://images.unsplash.com/photo-1557683316-973673baf926"}
                                />
                            </div>
                            <div className="flex-1 space-y-6 w-full">
                                <div className="flex items-center gap-4">
                                    <label className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-900 cursor-pointer hover:bg-gray-900 hover:text-white transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {uploading ? (
                                            <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                                        ) : (
                                            <HiOutlineCloudUpload size={16} />
                                        )}
                                        {uploading ? 'Uploading...' : 'Upload New Atmosphere'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                    {hero.bgImage && hero.bgImage.includes('supabase.co') && (
                                        <HiOutlineCheckCircle className="text-green-500" size={20} title="Uploaded successfully" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] text-gray-400 uppercase tracking-widest block">Or Background Image URL</label>
                                    <input
                                        required
                                        type="url"
                                        className="w-full bg-transparent py-2 text-sm text-gray-900 focus:outline-none border-t border-gray-50"
                                        value={hero.bgImage}
                                        onChange={(e) => setHero({ ...hero, bgImage: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2 border-b border-gray-100 pb-2">
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CTA Button Redirect</label>
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

                <div className="pt-4">
                    <button type="submit" className="w-full md:w-auto bg-admin-primary text-white px-12 md:px-20 py-4 md:py-5 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-gray-900 transition-all">
                        Update Portal Atmosphere
                    </button>
                </div>
            </form>

            {hero.bgImage && (
                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atmosphere Preview</p>
                    <div className="aspect-video md:aspect-[21/9] w-full bg-gray-100 overflow-hidden border border-gray-100">
                        <img src={hero.bgImage} className="w-full h-full object-cover" alt="" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminHero;
