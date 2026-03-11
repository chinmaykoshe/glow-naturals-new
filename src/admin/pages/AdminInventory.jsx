import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { HiOutlineStar, HiOutlineSparkles, HiStar, HiSparkles } from 'react-icons/hi';

function AdminInventory() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

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
            setFilteredProducts(p);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search')?.toLowerCase();
        if (search) {
            setFilteredProducts(products.filter(p =>
                p.name?.toLowerCase().includes(search) ||
                p.category?.toLowerCase().includes(search)
            ));
        } else {
            setFilteredProducts(products);
        }
    }, [location.search, products]);

    const updateStock = async (id, newStock) => {
        if (newStock === '') return;
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

    const toggleNewArrival = async (id, currentStatus) => {
        try {
            const productRef = doc(db, "products", id);
            await updateDoc(productRef, {
                newArrival: !currentStatus
            });
            fetchProducts();
        } catch (error) {
            console.error("Error updating new arrival status:", error);
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 min-h-[90vh] pb-64">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Vitality Controls</span>
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tighter">Inventory</h1>
            </div>

            <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-gray-50">
                    {filteredProducts.map((p) => {
                        const getCleanImage = (url) => {
                            if (!url) return "/default-images/generic.svg";
                            if (typeof url === 'string' && url.startsWith("//public/")) {
                                return url.replace("//public/", "/");
                            }
                            return url;
                        };
                        const pImage = getCleanImage(p.imageUrl || p.image);
                        const pStock = p.stock || p.inventory || 0;

                        return (
                            <div key={p.id} className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-gray-50/5 transition-all gap-8">
                                <div className="flex items-center gap-6 md:gap-8 flex-1">
                                    <img src={pImage} className="w-16 h-16 md:w-20 md:h-20 object-cover grayscale brightness-95 border border-gray-100 flex-shrink-0" alt="" />
                                    <div>
                                        <h3 className="text-lg md:text-xl font-serif text-gray-900 leading-tight mb-1">{p.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 md:gap-12 lg:justify-end">
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2">Bestseller</p>
                                            <button
                                                onClick={() => toggleBestseller(p.id, p.bestseller)}
                                                className={`p-3 md:p-4 transition-all ${p.bestseller ? 'bg-admin-primary text-white' : 'bg-gray-50 text-gray-200 hover:bg-gray-100 hover:text-admin-primary'}`}
                                            >
                                                {p.bestseller ? <HiStar size={18} /> : <HiOutlineStar size={18} />}
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2">New Arrival</p>
                                            <button
                                                onClick={() => toggleNewArrival(p.id, p.newArrival)}
                                                className={`p-3 md:p-4 transition-all ${p.newArrival ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-200 hover:bg-gray-100 hover:text-gray-900'}`}
                                            >
                                                {p.newArrival ? <HiSparkles size={18} /> : <HiOutlineSparkles size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center min-w-[100px]">
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2">Shelf Status</p>
                                        <span className={`text-[9px] md:text-[10px] font-bold px-4 py-2 block ${pStock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-admin-primary'}`}>
                                            {pStock < 5 ? 'CRITICAL LOW' : 'OPTIMAL'}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Units</p>
                                        <input
                                            type="number"
                                            className="w-20 md:w-24 bg-transparent border-b border-gray-100 py-1 text-base md:text-lg font-serif text-gray-900 focus:outline-none focus:border-admin-primary transition-all text-center"
                                            value={pStock}
                                            onChange={(e) => updateStock(p.id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredProducts.length === 0 && !loading && (
                        <div className="py-20 text-center text-gray-300">
                            <p className="font-serif italic text-xl">No products matched your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminInventory;
