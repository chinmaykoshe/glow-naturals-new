import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";

function Shop() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            const querySnapshot = await getDocs(collection(db, "products"));
            const p = [];
            querySnapshot.forEach((doc) => {
                p.push({ id: doc.id, ...doc.data() });
            });
            setProducts(p);
            setFilteredProducts(p);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchTerm = params.get("search")?.toLowerCase();

        let filtered = [...products];

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(searchTerm) ||
                p.category?.toLowerCase().includes(searchTerm) ||
                p.description?.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredProducts(filtered);
    }, [location.search, products]);

    const categories = ["All Products", ...new Set(products.map(p => p.category).filter(Boolean))];
    const currentSearch = new URLSearchParams(location.search).get("search");
    const currentSearchLower = currentSearch?.toLowerCase();
    const activeCategory = categories.find(
        (cat) => cat.toLowerCase() === currentSearchLower
    ) || "All Products";

    const categoryCounts = categories.reduce((acc, cat) => {
        acc[cat] = cat === "All Products"
            ? products.length
            : products.filter((p) => p.category === cat).length;
        return acc;
    }, {});

    const filterByCategory = (cat) => {
        if (cat === "All Products") {
            navigate('/shop');
        } else {
            navigate(`/shop?search=${encodeURIComponent(cat)}`);
        }
    };

    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32">

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 flex flex-col lg:grid lg:grid-cols-12 gap-24">
                {/* Mobile Category Filter */}
                <div className="lg:hidden">
                    <label
                        htmlFor="mobile-category"
                        className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 mb-3"
                    >
                        Shop Category
                    </label>
                    <div className="relative">
                        <select
                            id="mobile-category"
                            value={activeCategory}
                            onChange={(e) => filterByCategory(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-200 px-4 py-3.5 pr-12 text-sm font-semibold text-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-admin-primary/30 focus:border-admin-primary transition"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat} ({categoryCounts[cat] || 0})
                                </option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500 text-xs">
                            ▼
                        </span>
                    </div>
                </div>

                {/* Sidebar - Minimalist */}
                <aside className="hidden lg:block lg:col-span-3 space-y-16">
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 border-b border-gray-100 pb-4">Categories</h3>
                        <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {categories.map(cat => (
                                <li
                                    key={cat}
                                    onClick={() => filterByCategory(cat)}
                                    className={`hover:text-admin-primary cursor-pointer flex justify-between transition-colors ${(!currentSearch && cat === "All Products") ||
                                        currentSearchLower === cat.toLowerCase()
                                        ? "text-admin-primary" : ""
                                        }`}
                                >
                                    {cat} <span>{categoryCounts[cat] || 0}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="lg:col-span-9">
                    {currentSearch && (
                        <div className="mb-12">
                            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-tighter">
                                Found "{currentSearch}"
                            </h2>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                                Search Result
                            </p>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-32 text-center text-gray-300 font-serif italic text-xl">Loading products...</div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center">
                            <p className="font-serif italic text-xl text-gray-400 mb-4">No products found matching your search.</p>
                            <button
                                onClick={() => navigate('/shop')}
                                className="text-[10px] font-bold uppercase tracking-widest border-b border-gray-900 pb-1 rounded-none"
                            >
                                View full collection
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Shop;
