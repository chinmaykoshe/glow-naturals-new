import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function BestSellers() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("Popularity");

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const q = query(collection(db, "products"), where("bestseller", "==", true));
                const querySnapshot = await getDocs(q);
                const p = [];
                querySnapshot.forEach((doc) => {
                    p.push({ id: doc.id, ...doc.data() });
                });
                setProducts(p);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching bestsellers:", error);
                setLoading(false);
            }
        };
        fetchBestSellers();
    }, []);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === "Price: Low to High") return a.price - b.price;
        if (sortBy === "Price: High to Low") return b.price - a.price;
        return 0; // Default popularity (order of fetching)
    });

    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32 px-6 md:px-12 py-14">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="space-y-4">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Community Favorites</span>
                        <h1 className="text-6xl font-serif text-gray-900 tracking-tighter leading-none">Best Sellers</h1>
                        <p className="text-gray-500 max-w-xl text-lg leading-relaxed">
                            Our top products loved by everyone. Experience the natural quality
                            that has become a part of daily routines everywhere.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-gray-100 rounded-none px-6 py-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-admin-primary transition-all appearance-none cursor-pointer"
                        >
                            <option>Popularity</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-32 text-center text-gray-300 font-serif italic text-xl">Loading products...</div>
                ) : sortedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                        {sortedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center border border-dashed border-gray-100 rounded-none">
                        <p className="font-serif italic text-xl text-gray-400">The best sellers list is empty.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default BestSellers;
