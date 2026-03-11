import React, { useState, useEffect } from "react";
import CatagoryCard from "../components/CatagoryCard";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                // Fetch category definitions (images etc)
                const catDefSnapshot = await getDocs(collection(db, "categories"));
                const catDefs = {};
                catDefSnapshot.forEach(doc => {
                    catDefs[doc.data().name] = doc.data();
                });

                // Fetch products to count items per category
                const productSnapshot = await getDocs(collection(db, "products"));
                const catMap = {};
                productSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.category) {
                        const catName = data.category;
                        if (catMap[catName]) {
                            catMap[catName].count++;
                        } else {
                            catMap[catName] = {
                                name: catName,
                                count: 1,
                                image: catDefs[catName]?.imageUrl || data.imageUrl || data.image || '/default-images/generic.svg',
                                path: `/shop?search=${encodeURIComponent(catName)}`
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
        fetchCategoriesData();
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
