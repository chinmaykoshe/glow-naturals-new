import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencilAlt } from 'react-icons/hi';

const categoryImages = {
    'Skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
    'Body Care': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=600&q=80',
    'Wellness': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    'Hair Care': 'https://images.unsplash.com/photo-1594125355930-bc63630f9a2d?auto=format&fit=crop&w=600&q=80',
    'Essential Oils': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
};

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formProduct, setFormProduct] = useState({
        name: '',
        retailPrice: '',
        category: '',
        imageUrl: '',
        stock: 10,
        description: '',
        bestseller: false
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
            setProducts(p);
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
            productData.imageUrl = categoryImages[formProduct.category] || "//public/default-images/generic.svg";
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
            setFormProduct({ name: '', retailPrice: '', category: '', imageUrl: '', stock: 10, description: '', bestseller: false });
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
            bestseller: p.bestseller || false
        });
        setEditingId(p.id);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Archive this product permanently?")) {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Inventory</span>
                    <h1 className="text-5xl font-serif text-gray-900 tracking-tighter">Products</h1>
                </div>
                <button
                    onClick={() => {
                        setIsFormOpen(!isFormOpen);
                        setEditingId(null);
                        setFormProduct({ name: '', retailPrice: '', category: '', imageUrl: '', stock: 10, description: '', bestseller: false });
                    }}
                    className="bg-gray-900 text-white px-8 py-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-admin-primary transition-all rounded-none"
                >
                    {isFormOpen ? 'Discard' : <><HiOutlinePlus size={16} /> New Essence</>}
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="bg-white p-10 border border-gray-100 grid grid-cols-2 gap-8 rounded-none">
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Retail Value (₹)</label>
                        <input
                            required
                            type="number"
                            className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                            value={formProduct.retailPrice}
                            onChange={(e) => setFormProduct({ ...formProduct, retailPrice: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category / Domain</label>
                        <input
                            required
                            list="category-suggestions"
                            className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900"
                            placeholder="e.g. Wellness, Rituals"
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
                    <div className="col-span-2 space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                        <textarea
                            rows="2"
                            className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 resize-none"
                            value={formProduct.description}
                            onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1 space-y-2 border-b border-gray-100 pb-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visual Evidence (URL)</label>
                        <input
                            type="url"
                            className="w-full bg-transparent py-2 text-sm focus:outline-none text-gray-900 placeholder:text-gray-200"
                            placeholder="Leave empty for category default"
                            value={formProduct.imageUrl}
                            onChange={(e) => setFormProduct({ ...formProduct, imageUrl: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1 flex items-center gap-4">
                        <input
                            type="checkbox"
                            id="bestseller"
                            className="w-4 h-4 accent-admin-primary rounded-none"
                            checked={formProduct.bestseller}
                            onChange={(e) => setFormProduct({ ...formProduct, bestseller: e.target.checked })}
                        />
                        <label htmlFor="bestseller" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mark as Bestseller</label>
                    </div>
                    <div className="col-span-2 pt-4 text-right">
                        <button type="submit" className="bg-admin-primary text-white px-20 py-5 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-900 transition-all rounded-none shadow-none">
                            {editingId ? 'Confirm Divine Update' : 'Persist to Database'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white border border-gray-100 overflow-hidden rounded-none shadow-none">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Essence</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Domain</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Value</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vitality</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => {
                            const getCleanImage = (url) => {
                                if (!url) return "//public/default-images/generic.svg";
                                if (typeof url === 'string' && url.startsWith("//public/")) {
                                    return url.replace("//public/", "/");
                                }
                                return url;
                            };
                            const pImage = getCleanImage(p.imageUrl || p.image);
                            const pPrice = p.retailPrice || p.price;
                            const pStock = p.stock || p.inventory;

                            return (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <img src={pImage} className="w-12 h-12 object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                                {p.bestseller && <span className="text-[8px] bg-admin-primary text-white px-2 py-0.5 font-bold uppercase tracking-tighter">Bestseller</span>}
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
                {products.length === 0 && !loading && (
                    <div className="p-32 text-center text-gray-300">
                        <p className="font-serif italic text-2xl">The archive is silent.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminProducts;
