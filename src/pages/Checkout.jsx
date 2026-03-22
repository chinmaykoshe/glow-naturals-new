import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { HiArrowLeft, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineCreditCard } from "react-icons/hi";
import QRCode from "react-qr-code";

function Checkout() {
    const { cartItems, setCartItems } = useCart();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [finalTotal, setFinalTotal] = useState(0);
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        name: "",
        address: "",
        city: "",
        pincode: "",
        paymentMethod: "UPI / GPay"
    });

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 2000 ? 0 : 80;
    const total = subtotal + shipping;

    const generateUPILink = (id, amount) => {
        const upiId = "archanakoshe05@okicici";
        const merchantName = encodeURIComponent("Glow Naturals");
        const note = encodeURIComponent(`Order #${id.slice(0, 10).toUpperCase()}`);
        return `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount.toFixed(2)}&cu=INR&tn=${note}`;
    };

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
                        name: data.name || data.displayName || "",
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
            customerName: formData.name,
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

            // 🔥 Send confirmation email (non-blocking but safe)
            try {
                const emailRes = await fetch("/.netlify/functions/sendOrderEmail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formData.email,
                        orderId: docRef.id,
                        total,
                        status: "pending",
                        customerName: formData.name,
                        items: cartItems.map(item => ({
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        })),
                        shippingAddress: {
                            address: formData.address,
                            city: formData.city,
                            pincode: formData.pincode,
                            phone: formData.phone
                        }
                    }),
                });

                const emailData = await emailRes.json();

                if (!emailRes.ok) {
                    console.error("Email failed:", emailData);
                }
            } catch (emailError) {
                console.error("Email service error:", emailError);
            }

            console.log("Order placed successfully, ID:", docRef.id);
            setOrderId(docRef.id);
            setFinalTotal(total);
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
            <div className="min-h-screen bg-white pt-40 pb-20 px-6 text-center">
                <div className="max-w-2xl mx-auto space-y-12">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-admin-primary/10 flex items-center justify-center">
                            <HiOutlineShieldCheck className="text-admin-primary w-12 h-12" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.5em]">Order Completed</span>
                        <h1 className="text-5xl md:text-7xl font-serif text-gray-900 tracking-tighter">Thank You</h1>
                        <p className="text-gray-500 italic font-serif text-lg">
                            Your order has been received and is being processed.
                        </p>
                        <div className="inline-block px-4 py-2 bg-gray-50 border border-gray-100 mt-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                                Order ID: <span className="text-admin-primary font-mono not-italic">#{orderId.slice(0, 10).toUpperCase()}</span>
                            </p>
                            <p className="text-[9px] text-gray-400 mt-2 italic">(Confirmation email sent. Check your spam folder if you don't see it)</p>
                        </div>
                    </div>

                    {formData.paymentMethod === "UPI / GPay" && (
                        <div className="bg-gray-50/50 border border-gray-100 p-10 space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-900">Scan to Pay via UPI</h3>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                                    Please complete your payment of <span className="text-admin-primary font-bold">₹{finalTotal.toLocaleString('en-IN')}</span> using any UPI app.
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-center gap-6">
                                <a 
                                    href={generateUPILink(orderId, finalTotal)}
                                    className="p-6 bg-white border border-gray-100 shadow-sm hover:border-admin-primary transition-colors"
                                    title="Open UPI App"
                                >
                                    <QRCode 
                                        value={generateUPILink(orderId, finalTotal)}
                                        size={180}
                                        level="H"
                                    />
                                </a>

                                <a 
                                    href={generateUPILink(orderId, finalTotal)}
                                    className="w-full max-w-[180px] py-4 bg-admin-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] text-center shadow-lg hover:bg-black transition-all"
                                >
                                    Pay via UPI App
                                </a>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-3">
                                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">UPI ID: archanakoshe05@okicici</p>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText("archanakoshe05@okicici");
                                            alert("UPI ID copied to clipboard!");
                                        }}
                                        className="text-[8px] font-bold text-admin-primary uppercase tracking-widest hover:underline"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <p className="text-[9px] italic text-gray-400 max-w-sm mx-auto">
                                    Include your Order ID <span className="font-bold text-gray-600">#{orderId.slice(0, 10).toUpperCase()}</span> in the payment note for faster processing.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                        <Link to="/profile" className="inline-block bg-gray-900 text-white px-12 py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-admin-primary transition-all rounded-none">
                            Track Order
                        </Link>
                        <Link to="/shop" className="inline-block border border-gray-200 text-gray-900 px-12 py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all rounded-none">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
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
                                <div className="space-y-10 pt-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">01</div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900">Contact & Customer Info</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm font-light"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm font-light"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <div className="w-16 border-t-2 border-admin-primary/20"></div>
                                </div>

                                {/* Shipping Info */}
                                <div className="space-y-10 pt-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">02</div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900">Shipping Location</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">PIN Code (India)</label>
                                            <input
                                                type="text"
                                                required
                                                pattern="[0-9]{6}"
                                                maxLength="6"
                                                placeholder="6-digit PIN"
                                                value={formData.pincode}
                                                onChange={async (e) => {
                                                    const pin = e.target.value.replace(/\D/g, '');
                                                    setFormData(prev => ({ ...prev, pincode: pin }));
                                                    
                                                    if (pin.length === 6) {
                                                        try {
                                                            const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                                                            const data = await res.json();
                                                            if (data[0].Status === "Success" && data[0].PostOffice) {
                                                                const district = data[0].PostOffice[0].District;
                                                                const state = data[0].PostOffice[0].State;
                                                                setFormData(prev => ({ 
                                                                    ...prev, 
                                                                    city: `${district}, ${state}` 
                                                                }));
                                                            }
                                                        } catch (err) {
                                                            console.error("PIN Lookup failed:", err);
                                                        }
                                                    }
                                                }}
                                                className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-admin-primary transition-colors text-sm font-mono tracking-widest"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <div className="w-16 border-t-2 border-admin-primary/20"></div>
                                </div>

                                {/* Payment Info */}
                                <div className="space-y-10 pt-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">03</div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900">Payment Selection</h2>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="px-6 py-8 border-2 border-admin-primary bg-admin-primary/5 transition-all text-center flex-1">
                                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">UPI / GPay (Only)</p>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <p className="text-[10px] text-admin-primary font-bold uppercase tracking-widest animate-pulse">
                                            * UPI QR Code will be shown after you confirm the order
                                        </p>
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
                                <div className="flex justify-between items-end pt-6 mt-6 border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Grand Total</span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest italic">Inclusive of all taxes</span>
                                    </div>
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
