import React, { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import CatagoryCard from '../components/CatagoryCard'
import ProductCard from '../components/ProductCard'
import { HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineReceiptTax, HiOutlineArrowRight } from "react-icons/hi";
import { db } from '../firebase'
import { collection, query, limit, getDocs, where } from 'firebase/firestore'

const featuredCategories = [
    { name: "Skincare", items: "24 Products", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { name: "Body Care", items: "18 Products", image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { name: "Wellness", items: "15 Products", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
];

function Home() {
    const [trendingProducts, setTrendingProducts] = useState([]);

    useEffect(() => {
        const fetchTrending = async () => {
            // First try to fetch bestsellers
            const q = query(collection(db, "products"), where("bestseller", "==", true), limit(4));
            let querySnapshot = await getDocs(q);
            let products = [];
            querySnapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });

            // If less than 4 bestsellers, fetch more products
            if (products.length < 4) {
                const q2 = query(collection(db, "products"), limit(8));
                const querySnapshot2 = await getDocs(q2);
                querySnapshot2.forEach((doc) => {
                    if (!products.find(p => p.id === doc.id)) {
                        products.push({ id: doc.id, ...doc.data() });
                    }
                });
            }
            setTrendingProducts(products.slice(0, 4));
        };
        fetchTrending();
    }, []);
    return (
        <main className="bg-white">
            <Hero />

            {/* Why Glow Naturals - Minimalist Grid */}
            <section className="py-32 px-6 md:px-12 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
                        <div className="space-y-6">
                            <HiOutlineSparkles size={24} className="text-gray-900" />
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900">100% Organic</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Pure plant extracts sourced from sustainable gardens across India.</p>
                        </div>
                        <div className="space-y-6">
                            <HiOutlineShieldCheck size={24} className="text-gray-900" />
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900">Derm Tested</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Safe for all skin types. Formulated with zero harsh chemicals or perfumes.</p>
                        </div>
                        <div className="space-y-6">
                            <HiOutlineReceiptTax size={24} className="text-gray-900" />
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900">Ethical Beauty</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">Cruelty-free products with eco-friendly glass packaging for a cleaner planet.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Categories */}
            <section className="py-32 px-6 md:px-12 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-20 px-4">
                        <div className="space-y-4">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Top Collections</span>
                            <h2 className="text-5xl font-serif text-gray-900 tracking-tighter leading-none">Shop by Category</h2>
                        </div>
                        <button onClick={() => navigate('/shop')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2 group border-b border-gray-900 pb-2">
                            Explore All <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                        {featuredCategories.map((cat) => (
                            <CatagoryCard key={cat.name} category={cat} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Now */}
            <section className="py-32 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20 px-4">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block text-center">Trending</span>
                        <h2 className="text-5xl font-serif text-gray-900 tracking-tighter text-center">Community Favorites</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
                        {trendingProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;
