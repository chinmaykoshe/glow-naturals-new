import React from "react";
import { Link } from "react-router-dom";
import { IoCloseOutline } from "react-icons/io5";
import { useCart } from "../context/CartContext";

function Cart({ isOpen, onClose }) {
    const { cartItems, removeFromCart, updateQuantity } = useCart();

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className={`fixed inset-0 z-100 overflow-hidden transition-all duration-500 ${isOpen ? "visible" : "invisible"}`}>
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div
                    className={`w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            Your Bag
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{cartItems.length}</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition"
                        >
                            <IoCloseOutline size={28} />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                    <IoCloseOutline size={40} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Your bag is empty</h3>
                                    <p className="text-sm text-gray-500">Pick some natural products to get started.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="bg-gray-900 text-white px-8 py-3 rounded-none text-sm font-medium hover:bg-admin-primary transition"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-none bg-gray-50 border border-gray-100">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col">
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3 className="line-clamp-1">{item.name}</h3>
                                                <p className="ml-4 whitespace-nowrap">₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">Pure Product</p>
                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <div className="flex items-center border border-gray-200 rounded-none overflow-hidden bg-gray-50">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="px-3 py-1 hover:bg-gray-200 transition"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3 py-1 text-xs font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="px-3 py-1 hover:bg-gray-200 transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="font-medium text-admin-primary hover:text-accent-strong text-xs uppercase tracking-wider"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="border-t border-gray-100 px-6 py-8 bg-gray-50/50">
                            <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                                <p>Subtotal</p>
                                <p>₹{subtotal.toLocaleString('en-IN')}</p>
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500 mb-8 italic">Total will be updated at checkout.</p>
                            <div className="space-y-3">
                                <Link
                                    to="/checkout"
                                    onClick={onClose}
                                    className="w-full bg-gray-900 text-white py-4 rounded-none font-medium hover:bg-admin-primary transition shadow-none flex items-center justify-center uppercase tracking-widest text-[10px] font-bold"
                                >
                                    Review & Checkout
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Cart;