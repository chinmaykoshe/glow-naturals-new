import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineX } from "react-icons/hi";

function Profile() {
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfileData(data);
                    setFormData({
                        name: data.name || "",
                        phone: data.phone || "",
                        address: data.address || ""
                    });
                }

                const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                const orderList = [];
                querySnapshot.forEach((doc) => {
                    orderList.push({ id: doc.id, ...doc.data() });
                });
                setOrders(orderList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            } else {
                navigate("/login");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, formData);
            setProfileData({ ...profileData, ...formData });
            setIsModalOpen(false);
            alert("Changes saved successfully.");
        } catch (error) {
            console.error("Error updating details:", error);
            alert("Failed to save changes.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-serif italic text-gray-400">
            Loading your account...
        </div>
    );

    return (
        <main className="min-h-screen bg-white pt-24 md:pt-32">
            <section className="py-24 px-6 md:px-12 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                        <div className="space-y-4">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.5em] block">User Profile</span>
                            <h1 className="text-6xl font-serif text-gray-900 tracking-tighter leading-none">
                                Welcome, <br /> {profileData?.displayName || user?.email?.split('@')[0]}
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-900 text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-admin-primary transition-all rounded-none"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </section>

            <section className="py-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
                    {/* Member Stats */}
                    <div className="lg:col-span-4 space-y-16">
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-900 border-b border-gray-100 pb-4">Account Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1">Name</p>
                                    <p className="text-sm font-medium text-gray-900">{profileData?.name || 'Not Set'}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1">Phone Number</p>
                                    <p className="text-sm font-medium text-gray-900">{profileData?.phone || 'Not Added'}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1">Shipping Address</p>
                                    <p className="text-sm font-medium text-gray-900 leading-relaxed">{profileData?.address || 'Not added yet'}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1">Joined</p>
                                    <p className="text-sm font-medium text-gray-900">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-900 border-b border-gray-100 pb-4">Management</h3>
                            <div className="flex flex-col gap-6">
                                {profileData?.role === 'admin' && (
                                    <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-admin-primary hover:text-black transition flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-admin-primary"></span>
                                        Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-left text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition"
                                >
                                    Update Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="lg:col-span-8">
                        <div className="space-y-12">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 border-b border-gray-100 pb-4">Order History</h3>

                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 p-8 space-y-8 group hover:border-admin-primary transition-all rounded-none bg-gray-50/30">
                                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Order #{order.id.slice(0, 10)}</span>
                                                        <span className={`text-[11px] font-bold px-3 py-1 uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-50 text-admin-primary' : order.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                            }`}>
                                                            {order.status || 'Processing'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                        Placed on {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                                    </p>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1">Total Amount</p>
                                                    <p className="text-xl font-bold text-gray-900">₹{(order.totalAmount || order.total)?.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                                                <div className="space-y-4">
                                                    <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order Summary</h4>
                                                    <div className="space-y-4">
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                                                                    <img src={item.image || "/default-images/generic.svg"} className="w-full h-full object-cover grayscale" alt="" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">{item.name}</p>
                                                                    <p className="text-[11px] text-gray-400 uppercase">{item.quantity} x ₹{item.price}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Shipping Details</h4>
                                                    <div className="text-[11px] text-gray-500 space-y-1 uppercase tracking-wider leading-relaxed">
                                                        <p className="font-bold text-gray-900">{order.customerName || profileData?.displayName}</p>
                                                        <p>{order.shippingAddress?.address || order.address}</p>
                                                        <p>
                                                            {order.shippingAddress?.city || order.city}
                                                            {(order.shippingAddress?.city || order.city) && (order.shippingAddress?.pincode || order.pincode) ? ', ' : ''}
                                                            {order.shippingAddress?.pincode || order.pincode}
                                                        </p>
                                                        <p className="text-admin-primary font-bold pt-2">{order.phone || profileData?.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 border border-dashed border-gray-200 text-center rounded-none">
                                    <p className="font-serif italic text-xl text-gray-300">Your order history is empty.</p>
                                    <Link to="/shop" className="mt-8 inline-block text-[10px] font-bold uppercase tracking-widest border border-gray-900 px-8 py-4 hover:bg-gray-900 hover:text-white transition-all rounded-none">
                                        View Collection
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Preferences Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-xl p-10 md:p-12 relative z-10 rounded-none shadow-2xl">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-8 right-8 text-gray-400 hover:text-black transition"
                        >
                            <HiOutlineX size={24} />
                        </button>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <span className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.4em]">Personal Information</span>
                                <h2 className="text-4xl font-serif text-gray-900 tracking-tighter">Update Account</h2>
                            </div>

                            <form onSubmit={handleUpdateDetails} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-admin-primary transition-colors text-sm"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-admin-primary transition-colors text-sm"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Street Address</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full border border-gray-100 p-4 focus:outline-none focus:border-admin-primary transition-colors text-sm resize-none"
                                        placeholder="Your shipping address"
                                    />
                                </div>

                                <button
                                    disabled={isUpdating}
                                    type="submit"
                                    className="w-full bg-gray-900 text-white py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-admin-primary transition-all disabled:opacity-50 rounded-none"
                                >
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Profile;
