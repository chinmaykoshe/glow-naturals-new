import React from "react";
import { Link } from "react-router-dom";

function CatagoryCard({ category }) {
    const { name, items, image, path = "/shop" } = category;

    return (
        <Link
            to={path}
            className="group relative h-[220px] sm:h-[300px] md:h-[500px] overflow-hidden bg-gray-100 block"
        >
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />

            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 md:p-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Discover
                </span>
                <h3 className="text-2xl md:text-4xl font-serif font-medium mb-2 tracking-tight leading-tight whitespace-normal break-words max-w-full">
                    {name}
                </h3>
                <p className="text-xs font-medium tracking-widest uppercase text-gray-200 whitespace-normal break-words">
                    {items}
                </p>

                <div className="mt-12 h-px w-0 group-hover:w-24 bg-white transition-all duration-500" />
            </div>
        </Link>
    );
}

export default CatagoryCard;
