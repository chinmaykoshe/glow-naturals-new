import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CatagoryCard({ category }) {
    const { name, items, image, path = "/shop" } = category;
    const [imgSrc, setImgSrc] = useState(image);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const FALLBACK_IMAGE = "/default-images/generic.svg";

    useEffect(() => {
        // Reset state if image prop changes
        setImgSrc(image);
        setIsLoading(true);
        setHasError(false);

        // Timeout logic: if image hasn't loaded in 2.5 seconds, use fallback
        const timer = setTimeout(() => {
            if (isLoading) {
                console.log(`Image loading timeout for ${name}, using fallback.`);
                setImgSrc(FALLBACK_IMAGE);
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [image, name]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
        setImgSrc(FALLBACK_IMAGE);
    };

    return (
        <Link
            to={path}
            className="group relative h-[220px] sm:h-[300px] md:h-[500px] overflow-hidden bg-gray-50 block"
        >
            <img
                src={imgSrc || FALLBACK_IMAGE}
                alt={name}
                onLoad={handleLoad}
                onError={handleError}
                className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${isLoading ? 'blur-sm grayscale opacity-50' : 'blur-0 grayscale-0 opacity-100'}`}
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
