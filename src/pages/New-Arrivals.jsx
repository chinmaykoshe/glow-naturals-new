import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function NewArrivals() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            try {
                const q = query(
                    collection(db, "products"),
                    where("newArrival", "==", true)
                );
                const querySnapshot = await getDocs(q);
                const p = [];
                querySnapshot.forEach((doc) => {
                    p.push({ id: doc.id, ...doc.data() });
                });
                setProducts(p);
            } catch (error) {
                console.error("Error fetching new arrivals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNewArrivals();
    }, []);

    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32 px-4 md:px-8 py-14">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 animate-fadeIn">
                    <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Seasonal Release</span>
                    <h1 className="text-5xl font-serif text-gray-900 mb-6 tracking-tighter">Fresh from the Garden</h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed font-light">
                        Introducing our latest seasonal creations. Made with freshly picked plants
                        for natural radiance.
                    </p>
                </div>

                {loading ? (
                    <div className="py-32 text-center text-gray-300 font-serif italic text-xl">Discovering new essences...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-10">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="py-32 text-center">
                        <p className="font-serif italic text-xl text-gray-300">New arrivals coming soon.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default NewArrivals;
