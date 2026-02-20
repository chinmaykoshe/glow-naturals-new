import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { HiOutlineStar } from 'react-icons/hi';

function AdminInventory() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
            console.error("Error fetching inventory:", error);
            setLoading(false);
        }
    };

    const updateStock = async (id, newStock) => {
        try {
            const productRef = doc(db, "products", id);
            await updateDoc(productRef, {
                stock: parseInt(newStock)
            });
            fetchProducts();
        } catch (error) {
            console.error("Error updating stock:", error);
        }
    };

    const toggleBestseller = async (id, currentStatus) => {
        try {
            const productRef = doc(db, "products", id);
            await updateDoc(productRef, {
                bestseller: !currentStatus
            });
            fetchProducts();
        } catch (error) {
            console.error("Error updating bestseller status:", error);
        }
    };

    return (
        <div className="space-y-12">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Vitality Controls</span>
                <h1 className="text-5xl font-serif text-gray-900 tracking-tighter">Inventory</h1>
            </div>

            <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-gray-50">
                    {products.map((p) => {
                        const getCleanImage = (url) => {
                            if (!url) return "//public/default-images/generic.svg";
                            if (typeof url === 'string' && url.startsWith("//public/")) {
                                return url.replace("//public/", "/");
                            }
                            return url;
                        };
                        const pImage = getCleanImage(p.imageUrl || p.image);
                        const pStock = p.stock || p.inventory || 0;

                        return (
                            <div key={p.id} className="p-8 flex items-center justify-between hover:bg-gray-50/5 transition-all">
                                <div className="flex items-center gap-8">
                                    <div className="relative group">
                                        <img src={pImage} className="w-20 h-20 object-cover grayscale brightness-95" alt="" />
                                        <button
                                            onClick={() => toggleBestseller(p.id, p.bestseller)}
                                            className={`absolute -top-2 -right-2 p-2 shadow-xl transition-all ${p.bestseller ? 'bg-admin-primary text-white' : 'bg-white text-gray-200 hover:text-admin-primary'}`}
                                        >
                                            <HiOutlineStar size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif text-gray-900 leading-tight mb-1">{p.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-16">
                                    <div className="text-center min-w-[120px]">
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2">Shelf Status</p>
                                        <span className={`text-[10px] font-bold px-4 py-1.5 ${pStock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-admin-primary'}`}>
                                            {pStock < 5 ? 'CRITICAL LOW' : 'OPTIMAL STOCK'}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Units Available</p>
                                        <input
                                            type="number"
                                            className="w-24 bg-transparent border-b border-gray-100 py-2 text-lg font-serif text-gray-900 focus:outline-none focus:border-admin-primary transition-all"
                                            value={pStock}
                                            onChange={(e) => updateStock(p.id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default AdminInventory;
