import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { supabase } from '../../supabase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { HiOutlinePencilAlt, HiX, HiOutlineCloudUpload, HiOutlineCheckCircle } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Cropper from 'react-easy-crop';

const DEFAULT_CATEGORY_IMAGES = {
    'Skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
    'Body Care': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=600&q=80',
    'Wellness': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    'Hair Care': 'https://images.unsplash.com/photo-1594125355930-bc63630f9a2d?auto=format&fit=crop&w=600&q=80',
    'Essential Oils': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    'Face': 'https://images.unsplash.com/photo-1601049541289-9b1b7be00e57?auto=format&fit=crop&w=600&q=80'
};

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [uploading, setUploading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Image Cropping States
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [originalFileName, setOriginalFileName] = useState("");

    const [formCategory, setFormCategory] = useState({
        name: '',
        imageUrl: '',
        isFeatured: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch all products to get unique categories
            const productsSnapshot = await getDocs(collection(db, "products"));
            const productCategories = new Set();
            productsSnapshot.forEach(doc => {
                const cat = doc.data().category;
                if (cat) productCategories.add(cat);
            });

            // 2. Fetch category metadata (images, featured status)
            const metadataSnapshot = await getDocs(collection(db, "categories"));
            const metadataMap = {};
            metadataSnapshot.forEach(doc => {
                metadataMap[doc.id] = { id: doc.id, ...doc.data() };
            });

            // 3. Merge: One card for each category found in products
            const mergedCategories = Array.from(productCategories).map(catName => {
                const metadata = metadataMap[catName] || {};
                return {
                    id: catName, // Use catName as the ID
                    name: catName,
                    imageUrl: metadata.imageUrl || '',
                    isFeatured: metadata.isFeatured || false
                };
            });

            setCategories(mergedCategories);
            setFilteredCategories(mergedCategories);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dynamic categories:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search')?.toLowerCase();
        if (search) {
            setFilteredCategories(categories.filter(c =>
                c.name?.toLowerCase().includes(search)
            ));
        } else {
            setFilteredCategories(categories);
        }
    }, [location.search, categories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const categoryData = {
            name: formCategory.name,
            imageUrl: formCategory.imageUrl,
            isFeatured: formCategory.isFeatured,
            updatedAt: new Date()
        };

        try {
            // Use name as the ID to make categorization dynamic and synced
            await setDoc(doc(db, "categories", formCategory.name), categoryData, { merge: true });
            
            setIsFormOpen(false);
            setEditingCategory(null);
            setFormCategory({ name: '', imageUrl: '', isFeatured: false });
            fetchData();
        } catch (error) {
            console.error("Error saving category metadata:", error);
        }
    };

    const handleEdit = (c) => {
        setFormCategory({
            name: c.name,
            imageUrl: c.imageUrl || '',
            isFeatured: c.isFeatured || false
        });
        setEditingCategory(c);
        setIsFormOpen(true);
    };

    const deleteSupabaseImage = async (url) => {
        if (!url || !url.includes('supabase.co')) return;
        try {
            const fileName = url.split('/').pop();
            const { error } = await supabase.storage
                .from('glow-naturals')
                .remove([`categories/${fileName}`]);
            if (error) throw error;
        } catch (error) {
            console.error("Error deleting image from Supabase:", error);
        }
    };

    const toggleFeatured = async (c) => {
        const currentlyFeaturedCount = categories.filter(cat => cat.isFeatured).length;
        const newStatus = !c.isFeatured;

        if (newStatus && currentlyFeaturedCount >= 3) {
            alert("Maximum 3 collections can be featured on the homepage. Please unselect one before adding another.");
            return;
        }

        try {
            await setDoc(doc(db, "categories", c.name), {
                isFeatured: newStatus,
                updatedAt: new Date()
            }, { merge: true });
            fetchData();
        } catch (error) {
            console.error("Error toggling featured status:", error);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setOriginalFileName(file.name);
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageToCrop(reader.result);
            setShowCropper(true);
        });
        reader.readAsDataURL(file);
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => (image.onload = resolve));

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleCropSave = async () => {
        try {
            setUploading(true);
            setShowCropper(false);

            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const fileExt = originalFileName.split('.').pop() || 'jpg';
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `categories/${fileName}`;

            const { data, error } = await supabase.storage
                .from('glow-naturals')
                .upload(filePath, croppedBlob);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('glow-naturals')
                .getPublicUrl(filePath);

            if (formCategory.imageUrl && formCategory.imageUrl.includes('supabase.co')) {
                await deleteSupabaseImage(formCategory.imageUrl);
            }

            setFormCategory({ ...formCategory, imageUrl: publicUrl });
            setImageToCrop(null);
        } catch (error) {
            console.error('Error uploading cropped image:', error);
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 min-h-[90vh] pb-64">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Dynamic Structure</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tighter">Collections</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4 max-w-sm leading-relaxed">
                        Categories are derived directly from your products. Edit images here to customize their presentation.
                    </p>
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
                    <div className="bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl rounded-none">
                        <div className="sticky top-0 bg-white z-20 px-6 md:px-10 py-5 md:py-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <span className="text-admin-primary text-[9px] font-bold uppercase tracking-[0.3em] block mb-1">Appearance Settings</span>
                                <h2 className="text-xl md:text-2xl font-serif text-gray-900 tracking-tight italic">
                                    {formCategory.name}
                                </h2>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-black transition-colors p-2">
                                <HiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Collection Cover</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-32 bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                        <img
                                            src={formCategory.imageUrl || "/default-images/generic.svg"}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = "/default-images/generic.svg"}
                                        />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div className="flex gap-2 flex-wrap">
                                            {Object.entries(DEFAULT_CATEGORY_IMAGES).map(([name, url]) => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => setFormCategory({ ...formCategory, imageUrl: url })}
                                                    className={`px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest border transition-all ${formCategory.imageUrl === url ? 'bg-admin-primary text-white border-admin-primary' : 'border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900'}`}
                                                >
                                                    {name}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className={`inline-flex items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-widest border border-gray-900 cursor-pointer hover:bg-gray-900 hover:text-white transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                {uploading ? <AiOutlineLoading3Quarters className="animate-spin" size={14} /> : <HiOutlineCloudUpload size={14} />}
                                                {uploading ? 'Processing...' : 'Upload Image'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    className="w-4 h-4 accent-admin-primary"
                                    checked={formCategory.isFeatured}
                                    onChange={(e) => setFormCategory({ ...formCategory, isFeatured: e.target.checked })}
                                />
                                <label htmlFor="isFeatured" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Feature on Home Page</label>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 border border-gray-900 text-gray-900 py-4 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all rounded-none font-sans"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-admin-primary text-white py-4 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-900 transition-all rounded-none font-sans"
                                >
                                    Save Appearance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-100 overflow-hidden">
                {/* Header Row */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="col-span-1">Cover</div>
                    <div className="col-span-5">Collection Title</div>
                    <div className="col-span-3">Frontpage Status</div>
                    <div className="col-span-3 text-right">Management</div>
                </div>

                {/* Data Rows */}
                <div className="divide-y divide-gray-100">
                    {filteredCategories.map((c) => (
                        <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-6 items-center hover:bg-gray-50/50 transition-all group">
                            {/* Preview Image */}
                            <div className="col-span-1">
                                <div className="w-12 h-16 bg-gray-50 overflow-hidden border border-gray-100">
                                    <img 
                                        src={c.imageUrl || "/default-images/generic.svg"} 
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        alt={c.name}
                                        onError={(e) => e.target.src = "/default-images/generic.svg"}
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <div className="col-span-5">
                                <h3 className="text-xl font-serif text-gray-900 tracking-tight">{c.name}</h3>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Found in active catalog</p>
                            </div>

                            {/* Status */}
                            <div className="col-span-3">
                                <button
                                    onClick={() => toggleFeatured(c)}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                                        c.isFeatured 
                                        ? 'bg-admin-primary/5 text-admin-primary border-admin-primary/20' 
                                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${c.isFeatured ? 'bg-admin-primary animate-pulse' : 'bg-gray-300'}`} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">
                                        {c.isFeatured ? 'Featured' : 'Show on Home'}
                                    </span>
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="col-span-3 text-right">
                                <button 
                                    onClick={() => handleEdit(c)} 
                                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-gray-900 px-6 py-2.5 hover:bg-gray-900 hover:text-white transition-all font-sans"
                                >
                                    <HiOutlinePencilAlt size={14} /> Customize Appearance
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {filteredCategories.length === 0 && !loading && (
                <div className="py-32 text-center text-gray-300">
                    <p className="font-serif italic text-2xl">No categories found in your production collection.</p>
                </div>
            )}

            {showCropper && (
                <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 md:p-12 bg-black/90">
                    <div className="w-full max-w-2xl bg-white rounded-none overflow-hidden flex flex-col h-[80vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Crop Collection Cover</h3>
                            <button onClick={() => setShowCropper(false)} className="text-gray-400 hover:text-black">
                                <HiX size={20} />
                            </button>
                        </div>
                        <div className="flex-1 relative bg-gray-100">
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 5}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowCropper(false)} className="flex-1 border border-gray-900 py-4 text-[10px] font-bold uppercase tracking-widest font-sans">Cancel</button>
                                <button type="button" onClick={handleCropSave} className="flex-[2] bg-admin-primary text-white py-4 text-[10px] font-bold uppercase tracking-widest font-sans">Save Image</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCategories;
