import React from "react";
import ProductCard from "../components/ProductCard";

const arrivals = [
    { id: 10, name: "Charcoal Face Mask", price: 1299, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tag: "New", category: "Face" },
    { id: 11, name: "Retinol Night Cream", price: 2499, image: "https://images.unsplash.com/photo-1620917670397-dc71bce6d06a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tag: "New", category: "Face" },
    { id: 12, name: "Matcha Eye Patch", price: 899, image: "https://images.unsplash.com/photo-1556229167-da31d439a384?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tag: "New", category: "Face" },
    { id: 13, name: "Rose Water Toner", price: 1099, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", tag: "New", category: "Face" },
];

function NewArrivals() {
    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32 px-4 md:px-8 py-14">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">Seasonal Release</span>
                    <h1 className="text-5xl font-serif text-gray-900 mb-6 tracking-tighter">Fresh from the Garden</h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                        Introducing our latest seasonal creations. Made with freshly picked plants
                        for natural radiance.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
                    {arrivals.map((item) => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            </div>
        </main>
    );
}

export default NewArrivals;
