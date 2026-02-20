import React, { useState, useEffect } from "react";
import CatagoryCard from "../components/CatagoryCard";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const categoryImages = {
    'Skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
    'Body Care': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=600&q=80',
    'Wellness': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    'Hair Care': 'https://images.unsplash.com/photo-1594125355930-bc63630f9a2d?auto=format&fit=crop&w=600&q=80',
    'Essential Oils': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    'Face': 'https://images.unsplash.com/photo-1601049541289-9b1b7be00e57?auto=format&fit=crop&w=600&q=80'
};

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const catMap = {};
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.category) {
                        if (catMap[data.category]) {
                            catMap[data.category].count++;
                        } else {
                            catMap[data.category] = {
                                name: data.category,
                                count: 1,
                                image: data.imageUrl || categoryImages[data.category] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'
                            };
                        }
                    }
                });
                setCategories(Object.values(catMap));
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-serif italic text-gray-400">
            Loading categories...
        </div>
    );

    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32 px-4 md:px-8 py-14">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block mb-4">Our Worlds</span>
                    <h1 className="text-6xl font-serif text-gray-900 tracking-tighter leading-none mb-4">Shop by Category</h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                        Find exactly what you are looking for. Explore our nature-inspired collections
                        designed for every part of your beauty routine.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    {categories.map((cat) => (
                        <CatagoryCard key={cat.name} category={{ ...cat, items: `${cat.count} Products` }} />
                    ))}
                    {categories.length === 0 && (
                        <div className="col-span-full py-32 text-center text-gray-300">
                            <p className="font-serif italic text-xl">No categories found in our collections.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Categories;
