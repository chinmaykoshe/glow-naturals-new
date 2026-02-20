import React from "react";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
    const { addToCart, setIsCartOpen } = useCart();

    const {
        id,
        name,
        retailPrice,
        price,
        imageUrl,
        image,
        description,
        bestseller,
        tag
    } = product;

    const getCleanImage = (url) => {
        if (!url) return "/default-images/generic.svg";
        if (url.startsWith("//public/")) {
            return url.replace("//public/", "/");
        }
        return url;
    };

    const displayPrice = retailPrice || price;
    const displayImage = getCleanImage(imageUrl || image);
    const displayTag = bestseller ? "Bestseller" : tag;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ ...product, price: displayPrice, image: displayImage });
        setIsCartOpen(true);
    };

    return (
        <div key={id} className="group flex flex-col bg-white border border-gray-100 p-0 rounded-none transition-all duration-300 hover:shadow-lg">
            {/* Image Container */}
            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-none bg-gray-50 mb-2 sm:mb-3">
                {displayTag && (
                    <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gray-900 text-white px-2.5 sm:px-3 py-1 text-[9px] sm:text-[8px] font-bold uppercase tracking-[0.15em] sm:tracking-widest z-10 rounded-none">
                        {displayTag}
                    </span>
                )}
                <img
                    src={displayImage}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = "/default-images/generic.svg" }}
                />
            </div>

            {/* Content Container */}
            <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-base md:text-lg font-bold text-gray-900 uppercase tracking-tight leading-tight whitespace-normal break-words">
                        {name}
                    </h3>
                    <p className="text-xs sm:text-[10px] md:text-[11px] text-gray-500 font-medium line-clamp-2 leading-relaxed min-h-9 sm:h-10">
                        {description || "A natural care product for your daily routine."}
                    </p>
                </div>

                {/* Footer Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 md:pt-2">
                    <p className="text-2xl sm:text-xl md:text-2xl font-bold text-gray-900">
                        ₹{displayPrice?.toLocaleString('en-IN')}
                    </p>

                    <button
                        onClick={handleAddToCart}
                        className="w-full sm:w-auto bg-gray-900 text-white px-5 md:px-6 py-3 rounded-none text-[10px] md:text-[9px] font-bold uppercase tracking-[0.18em] hover:bg-admin-primary transition-all active:scale-95"
                    >
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
