import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { HiStar, HiOutlineStar, HiOutlineShoppingBag, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineRefresh, HiMinus, HiPlus, HiChevronRight } from "react-icons/hi";
import { Link } from "react-router-dom";

function ProductDetail() {
    const { id, category, productName } = useParams();
    const navigate = useNavigate();
    const { addToCart, setIsCartOpen } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    // Review State
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                if (id && id.length > 5) { // Likely a Firestore ID
                    const docRef = doc(db, "products", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setProduct({ id: docSnap.id, ...docSnap.data() });
                    }
                } else if (productName) {
                    // Try to find by name match
                    const querySnapshot = await getDocs(collection(db, "products"));
                    const slugifiedName = productName.toLowerCase();
                    let match = null;
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const dataSlug = data.name.toLowerCase().replace(/\s+/g, '-');
                        if (dataSlug === slugifiedName) {
                            match = { id: doc.id, ...data };
                        }
                    });
                    setProduct(match);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, productName]);

    useEffect(() => {
        if (!product?.id) return;

        const q = query(
            collection(db, "products", product.id, "reviews"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const r = [];
            snapshot.forEach((doc) => {
                r.push({ id: doc.id, ...doc.data() });
            });
            setReviews(r);
        });

        return () => unsubscribe();
    }, [product?.id]);

    const handleAddToCart = () => {
        if (!product) return;
        const displayPrice = product.retailPrice || product.price;
        const displayImage = product.imageUrl || product.image;

        for (let i = 0; i < quantity; i++) {
            addToCart({ ...product, price: displayPrice, image: displayImage });
        }
        setIsCartOpen(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert("Please login to leave a review");
            navigate('/login');
            return;
        }

        if (!newReview.comment.trim()) return;

        setSubmittingReview(true);
        try {
            await addDoc(collection(db, "products", product.id, "reviews"), {
                rating: newReview.rating,
                comment: newReview.comment,
                userName: auth.currentUser.displayName || "Glow User",
                userId: auth.currentUser.uid,
                createdAt: serverTimestamp()
            });
            setNewReview({ rating: 5, comment: '' });
        } catch (error) {
            console.error("Error adding review:", error);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-t-2 border-admin-primary rounded-full animate-spin"></div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Essence...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
                <h1 className="text-4xl font-serif text-gray-900 mb-4">Product Not Found</h1>
                <button onClick={() => navigate('/shop')} className="text-[10px] font-bold uppercase tracking-widest border-b border-gray-900 pb-1">Back to Shop</button>
            </div>
        );
    }

    const pImage = product.imageUrl || product.image || "/default-images/generic.svg";
    const pPrice = product.retailPrice || product.price;

    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-12 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <Link to="/" className="hover:text-admin-primary transition-colors">Home</Link>
                    <HiChevronRight size={12} />
                    <Link to="/shop" className="hover:text-admin-primary transition-colors">Shop</Link>
                    <HiChevronRight size={12} />
                    <Link to={`/shop?search=${encodeURIComponent(product.category)}`} className="hover:text-admin-primary transition-colors">{product.category}</Link>
                    <HiChevronRight size={12} />
                    <span className="text-gray-900 truncate max-w-[150px]">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
                    {/* Product Image Section */}
                    <div className="relative group overflow-hidden bg-gray-50 aspect-square">
                        <img
                            src={pImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {product.bestseller && (
                            <span className="absolute top-8 left-8 bg-gray-900 text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">
                                Bestseller
                            </span>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-10">
                            <p className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                                {product.category}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tighter mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <HiStar key={i} className={`w-4 h-4 ${i < (reviews.length ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 5) ? 'text-admin-primary' : 'text-gray-200'}`} />
                                ))}
                                <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">({reviews.length} Reviews)</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ₹{pPrice?.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center border border-gray-200 px-4 py-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <HiMinus size={16} />
                                    </button>
                                    <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <HiPlus size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-gray-900 text-white py-5 px-8 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-admin-primary transition-all flex items-center justify-center gap-3"
                                >
                                    <HiOutlineShoppingBag size={18} />
                                    Add to Bag
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gray-100">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <HiOutlineShieldCheck className="w-6 h-6 text-admin-primary" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Pure & Natural</span>
                                </div>
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <HiOutlineTruck className="w-6 h-6 text-admin-primary" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Fast Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <HiOutlineRefresh className="w-6 h-6 text-admin-primary" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mb-24">
                    <div className="flex gap-12 border-b border-gray-100 mb-10">
                        {['description', 'ingredients', 'how to use'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-admin-primary"></div>}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-3xl">
                        {activeTab === 'description' && (
                            <div className="prose prose-sm font-light text-gray-600 leading-relaxed text-sm animate-fadeIn">
                                {product.description || "No description available for this exquisite product."}
                            </div>
                        )}
                        {activeTab === 'ingredients' && (
                            <div className="prose prose-sm font-light text-gray-600 leading-relaxed text-sm animate-fadeIn">
                                {product.ingredients || "Handpicked natural ingredients. Full list available soon."}
                            </div>
                        )}
                        {activeTab === 'how to use' && (
                            <div className="prose prose-sm font-light text-gray-600 leading-relaxed text-sm animate-fadeIn">
                                {product.howToUse || "Gently apply to the desired area as part of your daily ritual."}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-100 pt-24">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-16">
                        <div className="w-full md:w-1/3">
                            <h2 className="text-3xl font-serif text-gray-900 tracking-tighter mb-6">Customer Reviews</h2>
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-4xl font-bold text-gray-900">
                                    {reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0"}
                                </span>
                                <div className="flex flex-col">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <HiStar key={i} className={`w-3 h-3 ${i < (reviews.length ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 5) ? 'text-admin-primary' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Based on {reviews.length} reviews</span>
                                </div>
                            </div>

                            <form onSubmit={handleReviewSubmit} className="space-y-6 bg-gray-50 p-8">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Leave a review</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className="transition-transform hover:scale-110"
                                        >
                                            {star <= newReview.rating ?
                                                <HiStar className="w-6 h-6 text-admin-primary" /> :
                                                <HiOutlineStar className="w-6 h-6 text-gray-300" />
                                            }
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    required
                                    placeholder="Tell us about your experience..."
                                    className="w-full bg-white border border-transparent p-4 text-sm focus:outline-none focus:border-admin-primary/30 resize-none h-32"
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                />
                                <button
                                    disabled={submittingReview}
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-admin-primary transition-all disabled:opacity-50"
                                >
                                    {submittingReview ? 'Sending...' : 'Post Review'}
                                </button>
                            </form>
                        </div>

                        <div className="w-full md:w-2/3 space-y-12">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-50 pb-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <HiStar key={i} className={`w-3 h-3 ${i < review.rating ? 'text-admin-primary' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{review.userName}</p>
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                {review.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm font-light leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-gray-50">
                                    <p className="font-serif italic text-gray-400 text-lg">Be the first to share your experience.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ProductDetail;
