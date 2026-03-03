import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, collectionGroup } from 'firebase/firestore';
import { HiOutlineTrash, HiStar } from 'react-icons/hi';

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllReviews();
    }, []);

    const fetchAllReviews = async () => {
        try {
            // First fetch all products to be able to map reviews to products
            const productsSnapshot = await getDocs(collection(db, "products"));
            const productNames = {};
            productsSnapshot.forEach(doc => {
                productNames[doc.id] = doc.data().name;
            });

            // Fetch all users to map userId to email
            const usersSnapshot = await getDocs(collection(db, "users"));
            const userEmails = {};
            usersSnapshot.forEach(doc => {
                userEmails[doc.id] = doc.data().email;
            });

            // Fetch all reviews using collectionGroup
            // Note: This requires a collection group index in Firestore
            const reviewsSnapshot = await getDocs(collectionGroup(db, "reviews"));
            const allReviews = [];

            reviewsSnapshot.forEach((reviewDoc) => {
                const reviewData = reviewDoc.data();
                // Get productId from the parent reference path
                // path is products/{productId}/reviews/{reviewId}
                const productId = reviewDoc.ref.parent.parent.id;

                allReviews.push({
                    id: reviewDoc.id,
                    productId: productId,
                    productName: productNames[productId] || "Unknown Product",
                    email: userEmails[reviewData.userId] || "Common User",
                    ...reviewData
                });
            });

            // Sort by date descending
            setReviews(allReviews.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching all reviews:", error);
            // If collectionGroup fails due to missing index, we fallback to manual fetching
            fallbackFetchReviews();
        }
    };

    const fallbackFetchReviews = async () => {
        try {
            const productsSnapshot = await getDocs(collection(db, "products"));
            const usersSnapshot = await getDocs(collection(db, "users"));

            const userEmails = {};
            usersSnapshot.forEach(doc => {
                userEmails[doc.id] = doc.data().email;
            });

            const allReviewsData = [];

            for (const productDoc of productsSnapshot.docs) {
                const pData = productDoc.data();
                const rSnapshot = await getDocs(collection(db, "products", productDoc.id, "reviews"));

                rSnapshot.forEach((reviewDoc) => {
                    const rData = reviewDoc.data();
                    allReviewsData.push({
                        id: reviewDoc.id,
                        productId: productDoc.id,
                        productName: pData.name,
                        email: userEmails[rData.userId] || "Glow User",
                        ...rData
                    });
                });
            }

            setReviews(allReviewsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            setLoading(false);
        } catch (err) {
            console.error("Fallback fetch failed:", err);
            setLoading(false);
        }
    };

    const handleDelete = async (productId, reviewId) => {
        if (window.confirm("Delete this review permanently?")) {
            try {
                await deleteDoc(doc(db, "products", productId, "reviews", reviewId));
                setReviews(reviews.filter(r => r.id !== reviewId));
            } catch (error) {
                console.error("Error deleting review:", error);
            }
        }
    };

    if (loading) {
        return <div className="py-32 text-center text-gray-300 font-serif italic text-xl">Curating feedback...</div>;
    }

    return (
        <div className="space-y-8 md:space-y-12 min-h-[90vh] pb-64">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Social Proof</span>
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tighter">Customer Reviews</h1>
            </div>

            {reviews.length === 0 ? (
                <div className="py-20 text-center text-gray-300 border border-dashed border-gray-100">
                    <p className="font-serif italic text-xl">No reviews found in the garden.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 overflow-hidden">
                    <div className="hidden md:block">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Feedback</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reviews.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-gray-900">{r.productName}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-gray-900">{r.userName}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tight">{r.email}</p>
                                        </td>
                                        <td className="px-8 py-6 max-w-xs">
                                            <div className="flex gap-0.5 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <HiStar key={i} className={`w-3 h-3 ${i < r.rating ? 'text-admin-primary' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 italic line-clamp-2">"{r.comment}"</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'Recent'}
                                            </p>
                                            <p className="text-[10px] text-gray-300 uppercase tracking-tighter">
                                                {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => handleDelete(r.productId, r.id)} className="text-gray-200 hover:text-red-500 transition-all p-2">
                                                <HiOutlineTrash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-50">
                        {reviews.map((r) => (
                            <div key={r.id} className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-bold text-admin-primary uppercase tracking-widest mb-1">{r.productName}</p>
                                        <p className="font-bold text-gray-900">{r.userName}</p>
                                        <p className="text-[10px] text-gray-400 uppercase">{r.email}</p>
                                    </div>
                                    <button onClick={() => handleDelete(r.productId, r.id)} className="text-gray-300 hover:text-red-500">
                                        <HiOutlineTrash size={20} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <HiStar key={i} className={`w-3 h-3 ${i < r.rating ? 'text-admin-primary' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 italic leading-relaxed">"{r.comment}"</p>
                                </div>
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest pt-2 border-t border-gray-50 w-full text-right">
                                    {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : 'Just now'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminReviews;
