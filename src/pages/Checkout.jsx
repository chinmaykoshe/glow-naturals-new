import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { HiArrowLeft, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineCreditCard } from "react-icons/hi";

function Checkout() {
    const { cartItems, setCartItems } = useCart();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        fullName: "",
        address: "",
        city: "",
        pincode: "",
        paymentMethod: "UPI / GPay"
    });

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 2000 ? 0 : 80;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setFormData(prev => ({
                        ...prev,
                        email: currentUser.email || "",
                        phone: data.phone || "",
                        fullName: data.displayName || "",
                        address: data.address || ""
                    }));
                }
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsProcessing(true);

        const orderData = {
            userId: user.uid,
            customerName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            shippingAddress: {
                address: formData.address,
                city: formData.city,
                pincode: formData.pincode
            },
            paymentMethod: formData.paymentMethod,
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal,
            shipping,
            tax,
            totalAmount: total,
            status: "pending",
            createdAt: serverTimestamp()
        };

        try {
            console.log("Attempting to place order with data:", orderData);
            if (!orderData.items || orderData.items.length === 0) {
                throw new Error("Cannot place empty order");
            }

            const docRef = await addDoc(collection(db, "orders"), orderData);
            console.log("Order placed successfully, ID:", docRef.id);
            setOrderId(docRef.id);
            setCartItems([]);
            setIsSuccess(true);
        } catch (error) {
            console.error("Critical Error placing order:", error);
            alert(`Failed to place your order. Error: ${error.message || 'Unknown error occurred'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white pt-40 px-6 text-center space-y-8">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-admin-primary/10 flex items-center justify-center">
                        <HiOutlineShieldCheck className="text-admin-primary w-12 h-12" />
                    </div>
                </div>
                <div className="space-y-4">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em]">Order Placed</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-gray-900 tracking-tighter">Thank You</h1>
                    <p className="text-gray-500 max-w-md mx-auto italic font-serif text-lg">
                        Your natural products are being prepared. <br />
                        Order ID: <span className="text-admin-primary font-mono not-italic uppercase tracking-widest text-sm">#{orderId.slice(0, 10)}</span>
                    </p>
                </div>
                <Link to="/profile" className="inline-block bg-gray-900 text-white px-12 py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-admin-primary transition-all rounded-none">
                    Track Order
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-10 pt-20">
                <p className="font-serif italic text-3xl text-gray-300">Your bag is currently empty.</p>
                <Link to="/shop" className="bg-gray-900 text-white px-12 py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-admin-primary transition-all rounded-none">
                    Return to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-admin-primary mb-16 transition-colors"
                >
                    <HiArrowLeft /> Return
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-8 space-y-20">
                        <section className="space-y-16">
                            <div className="space-y-4">
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em] block">Order Summary</span>
                                <h1 className="text-6xl font-serif text-gray-900 tracking-tighter leading-none">Checkout</h1>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-20">
                                {/* Contact Info */}
                                <div className="space-y-10 border-t border-gray-100 pt-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">01</div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900">Contact Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="space-y-10 border-t border-gray-100 pt-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">02</div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900">Shipping Details</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm"
                                            />
                                        </div>
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Street Address</label>
                                            <textarea
                                                rows={2}
                                                required
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full bg-transparent border border-gray-100 p-4 focus:outline-none focus:border-admin-primary transition-colors text-sm resize-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">City</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">PIN Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.pincode}
                                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="space-y-10 border-t border-gray-100 pt-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">03</div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900">Payment Selection</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {['Credit/Debit Card', 'UPI / GPay', 'Cash on Delivery'].map((method) => (
                                            <label key={method} className="relative cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    className="peer sr-only"
                                                    checked={formData.paymentMethod === method}
                                                    onChange={() => setFormData({ ...formData, paymentMethod: method })}
                                                />
                                                <div className="px-6 py-8 border border-gray-100 peer-checked:border-admin-primary peer-checked:bg-admin-primary/5 transition-all text-center">
                                                    <p className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">{method}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-gray-900 text-white py-6 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-admin-primary transition-all rounded-none disabled:opacity-50"
                                >
                                    {isProcessing ? "Placing Order..." : `Confirm Order • ₹${total.toLocaleString('en-IN')}`}
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-40">
                        <section className="border border-gray-100 p-10 space-y-10 rounded-none bg-gray-50/30">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-900 border-b border-gray-100 pb-6">Order Summary</h2>

                            <div className="space-y-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-6">
                                        <div className="w-20 h-20 bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h4 className="text-[11px] font-bold text-black uppercase tracking-wider truncate">{item.name}</h4>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                                            <p className="text-xs font-bold text-admin-primary mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-8 border-t border-gray-100">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-gray-400">Shipping</span>
                                    <span className={shipping === 0 ? "text-admin-primary" : "text-gray-900"}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-gray-400">Tax Total</span>
                                    <span className="text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-end pt-6 mt-6 border-t border-gray-100">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Grand Total</span>
                                    <span className="text-2xl font-serif text-admin-primary font-bold">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
