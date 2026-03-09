import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { supabase } from '../../supabase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencilAlt, HiX, HiOutlineCloudUpload, HiOutlineCheckCircle } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Cropper from 'react-easy-crop';

const categoryImages = {
    'Skincare': '/default-images/moisturizer.svg',
    'Face Wash': '/default-images/facewash.svg',
    'Body Care': '/default-images/moisturizer.svg',
    'Wellness': '/default-images/serum.svg',
    'Hair Care': '/default-images/haircare.svg',
    'Essential Oils': '/default-images/perfume.svg',
    'Soap': '/default-images/soap.svg',
    'Bath Kit': '/default-images/bathkit.svg',
    'Joint Care': '/default-images/jointcare.svg',
    'Lip Care': '/default-images/lipstick.svg',
    'Weight Loss': '/default-images/weightloss.svg',
    'Winter Kit': '/default-images/winterkit.svg',
    'Other': '/default-images/generic.svg'
};

const DEFAULT_IMAGES = {
    'Generic': '/default-images/generic.svg',
    'Moisturizer': '/default-images/moisturizer.svg',
    'Serum': '/default-images/serum.svg',
    'Face Wash': '/default-images/facewash.svg',
    'Hair Care': '/default-images/haircare.svg',
    'Shampoo': '/default-images/shampoo.svg',
    'Perfume/Oil': '/default-images/perfume.svg',
    'Lipstick': '/default-images/lipstick.svg',
    'Soap': '/default-images/soap.svg',
    'Bath Kit': '/default-images/bathkit.svg',
    'Joint Care': '/default-images/jointcare.svg',
    'Weight Loss': '/default-images/weightloss.svg',
    'Winter Kit': '/default-images/winterkit.svg'
};

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Image Cropping States
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [originalFileName, setOriginalFileName] = useState("");

    const [formProduct, setFormProduct] = useState({
        name: '',
        retailPrice: '',
        category: '',
        imageUrl: '',
        stock: 10,
        description: '',
        ingredients: '',
        howToUse: '',
        bestseller: false,
        newArrival: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const p = [];
            querySnapshot.forEach((doc) => {
                p.push({ id: doc.id, ...doc.data() });
            });
            setProducts(p.sort((a, b) => b.updatedAt?.seconds - a.updatedAt?.seconds));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = {
            ...formProduct,
            retailPrice: parseFloat(formProduct.retailPrice),
            stock: parseInt(formProduct.stock),
            updatedAt: new Date()
        };

        if (!productData.imageUrl) {
            productData.imageUrl = categoryImages[formProduct.category] || "/default-images/generic.svg";
        }

        try {
            if (editingId) {
                await updateDoc(doc(db, "products", editingId), productData);
            } else {
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: new Date()
                });
            }
            setIsFormOpen(false);
            setEditingId(null);
            setFormProduct({ name: '', retailPrice: '', category: '', imageUrl: '', stock: 10, description: '', ingredients: '', howToUse: '', bestseller: false, newArrival: false });
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    const handleEdit = (p) => {
        setFormProduct({
            name: p.name || '',
            retailPrice: p.retailPrice || p.price || '',
            category: p.category || '',
            imageUrl: p.imageUrl || p.image || '',
            stock: p.stock || p.inventory || 10,
            description: p.description || '',
            ingredients: p.ingredients || '',
            howToUse: p.howToUse || '',
            bestseller: p.bestseller || false,
            newArrival: p.newArrival || false
        });
        setEditingId(p.id);
        setIsFormOpen(true);
    };

    const deleteSupabaseImage = async (url) => {
        if (!url || !url.includes('supabase.co')) return;
        try {
            const fileName = url.split('/').pop();
            const { error } = await supabase.storage
                .from('glow-naturals')
                .remove([fileName]);
            if (error) throw error;
            console.log("Deleted old image:", fileName);
        } catch (error) {
            console.error("Error deleting image from Supabase:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Archive this product permanently?")) {
            const product = products.find(p => p.id === id);
            if (product) {
                const imgToDelete = product.imageUrl || product.image;
                if (imgToDelete) {
                    await deleteSupabaseImage(imgToDelete);
                }
            }
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
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
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from('glow-naturals')
                .upload(filePath, croppedBlob);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('glow-naturals')
                .getPublicUrl(filePath);

            // Delete old image if it was a Supabase URL before updating
            if (formProduct.imageUrl && formProduct.imageUrl.includes('supabase.co')) {
                await deleteSupabaseImage(formProduct.imageUrl);
            }

            setFormProduct({ ...formProduct, imageUrl: publicUrl });
            setImageToCrop(null);
        } catch (error) {
            console.error('Error uploading cropped image:', error);
            alert('Error: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e) => {
        // Keeping this for reference, but shifting logic to handleImageSelect + handleCropSave
        handleImageSelect(e);
    };

    return (
        <div className="space-y-8 md:space-y-12 min-h-[90vh] pb-64">
            {/* Header Section - Responsive */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Stock Control</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tighter">Products</h1>
                </div>
                <button
                    onClick={() => {
                        setIsFormOpen(true);
                        setEditingId(null);
                        setFormProduct({ name: '', retailPrice: '', category: '', imageUrl: '', stock: 10, description: '', ingredients: '', howToUse: '', bestseller: false, newArrival: false });
                    }}
                    className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-admin-primary transition-all rounded-none"
                >
                    <HiOutlinePlus size={16} /> New Product
                </button>
            </div>

            {/* Modal Overlay - Responsive */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 animate-fadeIn">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsFormOpen(false)}
                    ></div>

                    <div className="bg-white w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl rounded-none">
                        <div className="sticky top-0 bg-white z-20 px-6 md:px-10 py-5 md:py-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <span className="text-admin-primary text-[9px] font-bold uppercase tracking-[0.3em] block mb-1">Stock Management</span>
                                <h2 className="text-xl md:text-2xl font-serif text-gray-900 tracking-tight">
                                    {editingId ? 'Edit Essence' : 'New Creation'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="text-gray-400 hover:text-black transition-colors p-2"
                            >
                                <HiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                    value={formProduct.name}
                                    onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price (₹)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                    value={formProduct.retailPrice}
                                    onChange={(e) => setFormProduct({ ...formProduct, retailPrice: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                                <input
                                    required
                                    list="category-suggestions"
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                    placeholder="e.g. Wellness, Skincare"
                                    value={formProduct.category}
                                    onChange={(e) => {
                                        const cat = e.target.value;
                                        setFormProduct({
                                            ...formProduct,
                                            category: cat,
                                            imageUrl: formProduct.imageUrl || categoryImages[cat] || ''
                                        });
                                    }}
                                />
                                <datalist id="category-suggestions">
                                    {Object.keys(categoryImages).map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Stock</label>
                                <input
                                    type="number"
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                                    value={formProduct.stock}
                                    onChange={(e) => setFormProduct({ ...formProduct, stock: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    rows="2"
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 resize-none"
                                    value={formProduct.description}
                                    onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ingredients</label>
                                <textarea
                                    rows="2"
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 resize-none"
                                    value={formProduct.ingredients}
                                    onChange={(e) => setFormProduct({ ...formProduct, ingredients: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2 border-b border-gray-100 pb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">How to Use</label>
                                <textarea
                                    rows="2"
                                    className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 resize-none"
                                    value={formProduct.howToUse}
                                    onChange={(e) => setFormProduct({ ...formProduct, howToUse: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-1 space-y-4 border-b border-gray-100 pb-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Default Image</label>
                                    <select
                                        className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 appearance-none cursor-pointer"
                                        onChange={(e) => e.target.value && setFormProduct({ ...formProduct, imageUrl: e.target.value })}
                                        value={Object.values(DEFAULT_IMAGES).includes(formProduct.imageUrl) ? formProduct.imageUrl : ""}
                                    >
                                        <option value="">-- Choose Premium Preset --</option>
                                        {Object.entries(DEFAULT_IMAGES).map(([name, url]) => (
                                            <option key={url} value={url}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Upload to Supabase (Square Crop)</label>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="relative group">
                                            <div className="w-16 h-16 bg-gray-50 border border-gray-100 overflow-hidden">
                                                <img
                                                    src={formProduct.imageUrl || "/default-images/generic.svg"}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.target.src = "/default-images/generic.svg"}
                                                />
                                            </div>
                                            {formProduct.imageUrl && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <HiOutlineCheckCircle className="text-white" size={20} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <label className={`inline-flex items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-widest border border-gray-900 cursor-pointer hover:bg-gray-900 hover:text-white transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                {uploading ? (
                                                    <AiOutlineLoading3Quarters className="animate-spin" size={14} />
                                                ) : (
                                                    <HiOutlineCloudUpload size={14} />
                                                )}
                                                {uploading ? 'Processing...' : 'Upload & Crop'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    disabled={uploading}
                                                />
                                            </label>
                                            {formProduct.imageUrl && formProduct.imageUrl.includes('supabase.co') && (
                                                <p className="text-[8px] font-bold text-green-600 uppercase tracking-tighter flex items-center gap-1">
                                                    <HiOutlineCheckCircle size={10} /> Cloud Sync Active
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1 pt-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Custom URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent py-1 text-sm focus:outline-none text-gray-900 placeholder:text-gray-200 border-t border-gray-50 mt-1"
                                        placeholder="Paste custom link here"
                                        value={formProduct.imageUrl}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            const shorthands = {
                                                '/generic': '/default-images/generic.svg',
                                                '/moisturiser': '/default-images/moisturizer.svg',
                                                '/serum': '/default-images/serum.svg',
                                                '/facewash': '/default-images/facewash.svg',
                                                '/cleanser': '/default-images/facewash.svg',
                                                '/shampoo': '/default-images/shampoo.svg',
                                                '/haircare': '/default-images/haircare.svg',
                                                '/perfume': '/default-images/perfume.svg',
                                                '/lipstick': '/default-images/lipstick.svg',
                                                '/soap': '/default-images/soap.svg',
                                                '/bathkit': '/default-images/bathkit.svg',
                                                '/jointcare': '/default-images/jointcare.svg',
                                                '/weightloss': '/default-images/weightloss.svg',
                                                '/winterkit': '/default-images/winterkit.svg'
                                            };

                                            if (shorthands[val.toLowerCase()]) {
                                                val = shorthands[val.toLowerCase()];
                                            }

                                            setFormProduct({ ...formProduct, imageUrl: val });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-1 flex flex-col md:flex-row gap-4 md:gap-12 py-4 md:py-0 border-b border-gray-100 md:border-b-0">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        id="bestseller"
                                        className="w-5 h-5 md:w-4 md:h-4 accent-admin-primary rounded-none"
                                        checked={formProduct.bestseller}
                                        onChange={(e) => setFormProduct({ ...formProduct, bestseller: e.target.checked })}
                                    />
                                    <label htmlFor="bestseller" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Mark as Bestseller</label>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        id="newArrival"
                                        className="w-5 h-5 md:w-4 md:h-4 accent-admin-primary rounded-none"
                                        checked={formProduct.newArrival}
                                        onChange={(e) => setFormProduct({ ...formProduct, newArrival: e.target.checked })}
                                    />
                                    <label htmlFor="newArrival" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer">Mark as New Arrival</label>
                                </div>
                            </div>
                            <div className="md:col-span-2 pt-6 md:pt-8 flex flex-col-reverse md:flex-row gap-4 mb-10 md:mb-0">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="w-full md:flex-1 border border-gray-900 text-gray-900 py-5 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all rounded-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full md:flex-[2] bg-admin-primary text-white py-5 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-900 transition-all rounded-none shadow-none"
                                >
                                    {editingId ? 'Update Product' : 'Add to Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block bg-white border border-gray-100 overflow-hidden rounded-none shadow-none">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => {
                            const getCleanImage = (url) => {
                                if (!url) return "/default-images/generic.svg";
                                return url.replace("//public/", "/");
                            };
                            const pImage = getCleanImage(p.imageUrl || p.image);
                            const pPrice = p.retailPrice || p.price;
                            const pStock = p.stock || p.inventory;

                            return (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 overflow-hidden border border-gray-100">
                                                <img
                                                    src={pImage}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                                    alt=""
                                                    onError={(e) => e.target.src = "/default-images/generic.svg"}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {p.bestseller && <span className="text-[7px] bg-admin-primary text-white px-2 py-0.5 font-bold uppercase tracking-tighter">Bestseller</span>}
                                                    {p.newArrival && <span className="text-[7px] bg-gray-900 text-white px-2 py-0.5 font-bold uppercase tracking-tighter">New Arrival</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-400 uppercase tracking-widest font-bold text-[9px]">{p.category}</td>
                                    <td className="px-8 py-5 text-sm text-gray-900 font-bold">₹{pPrice?.toLocaleString()}</td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[9px] font-bold px-3 py-1 ${pStock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-admin-primary'}`}>
                                            {pStock} UNITS
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(p)} className="text-gray-300 hover:text-admin-primary transition-all">
                                                <HiOutlinePencilAlt size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition-all">
                                                <HiOutlineTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - Visible only on Small Screens */}
            <div className="md:hidden space-y-4">
                {products.map((p) => {
                    const getCleanImage = (url) => {
                        if (!url) return "/default-images/generic.svg";
                        return url.replace("//public/", "/");
                    };
                    const pImage = getCleanImage(p.imageUrl || p.image);
                    const pPrice = p.retailPrice || p.price;
                    const pStock = p.stock || p.inventory;

                    return (
                        <div key={p.id} className="bg-white border border-gray-100 p-5 space-y-4">
                            <div className="flex items-start gap-4">
                                <img
                                    src={pImage}
                                    className="w-16 h-16 object-cover border border-gray-100"
                                    alt=""
                                    onError={(e) => e.target.src = "/default-images/generic.svg"}
                                />
                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap gap-2 text-[8px] uppercase font-bold tracking-widest pb-1 border-b border-gray-50 mb-1">
                                        <span className="text-gray-400 mr-auto">{p.category}</span>
                                        {p.bestseller && <span className="bg-admin-primary text-white px-2 py-0.5">Bestseller</span>}
                                        {p.newArrival && <span className="bg-gray-900 text-white px-2 py-0.5">New Arrival</span>}
                                    </div>
                                    <p className="font-bold text-gray-900 leading-tight">{p.name}</p>
                                    <p className="font-bold text-gray-900 pt-1">₹{pPrice?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div className={`text-[10px] font-bold px-3 py-1 ${pStock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-admin-primary'}`}>
                                    {pStock} IN STOCK
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="p-2 text-gray-400 hover:text-admin-primary"
                                    >
                                        <HiOutlinePencilAlt size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <HiOutlineTrash size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {products.length === 0 && !loading && (
                <div className="py-20 md:p-32 text-center text-gray-300">
                    <p className="font-serif italic text-xl md:text-2xl">No products found.</p>
                </div>
            )}
            {/* Image Cropper Modal */}
            {showCropper && (
                <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 md:p-12 animate-fadeIn bg-black/90">
                    <div className="w-full max-w-2xl bg-white rounded-none overflow-hidden flex flex-col h-[80vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold uppercase tracking-widest">Perfect Square Crop</h3>
                            <button onClick={() => setShowCropper(false)} className="text-gray-400 hover:text-black">
                                <HiX size={20} />
                            </button>
                        </div>

                        <div className="flex-1 relative bg-gray-100">
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1 / 1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Zoom Intensity</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="w-full h-1 bg-gray-100 appearance-none cursor-pointer accent-admin-primary"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCropper(false)}
                                    className="flex-1 border border-gray-900 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCropSave}
                                    className="flex-[2] bg-admin-primary text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 shadow-xl"
                                >
                                    Crop & Finalize Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProducts;
