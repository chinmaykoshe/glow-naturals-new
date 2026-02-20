import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { HiOutlineX, HiOutlineDotsVertical, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "orders"));
            const o = [];
            querySnapshot.forEach((doc) => {
                o.push({ id: doc.id, ...doc.data() });
            });
            setOrders(o.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await updateDoc(doc(db, "orders", id), { status });
            fetchOrders();
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Archive this order permanently? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "orders", id));
                fetchOrders();
                if (selectedOrder && selectedOrder.id === id) {
                    setSelectedOrder(null);
                }
            } catch (error) {
                console.error("Error deleting order:", error);
            }
        }
    };

    return (
        <div className="space-y-12 relative min-h-[80vh]">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Commerce Flow</span>
                <h1 className="text-5xl font-serif text-gray-900 tracking-tighter">Orders</h1>
            </div>

            <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Reference</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ritualist</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sum</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Phase</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="px-8 py-5 font-mono text-[10px] text-gray-400">#{order.id.slice(0, 10).toUpperCase()}</td>
                                <td className="px-8 py-5">
                                    <div className="text-sm font-bold text-gray-900">{order.customerName || `${order.firstName || ''} ${order.lastName || ''}`}</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{order.email}</div>
                                </td>
                                <td className="px-8 py-5 text-sm font-bold text-gray-900">₹{(order.totalAmount || order.total)?.toLocaleString()}</td>
                                <td className="px-8 py-5">
                                    <span className={`text-[9px] font-bold px-3 py-1 uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-50 text-admin-primary' :
                                        order.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {order.status || 'pending'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="text-gray-300 hover:text-admin-primary transition-all p-2"
                                    >
                                        <HiOutlineEye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="text-gray-200 hover:text-red-500 transition-all p-2"
                                    >
                                        <HiOutlineTrash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && !loading && (
                    <div className="p-32 text-center text-gray-300">
                        <p className="font-serif italic text-2xl">The order stream is still.</p>
                    </div>
                )}
            </div>

            {/* Order Details Sliding Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-1">Manifest Details</span>
                                <h2 className="text-2xl font-serif text-gray-900">Order #{selectedOrder.id.slice(0, 10).toUpperCase()}</h2>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-900 transition-all p-2">
                                <HiOutlineX size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-12">
                            {/* Status Orchestration */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Lifecycle Phase</h4>
                                <div className="flex gap-2">
                                    {['pending', 'processing', 'shipped', 'delivered'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => updateStatus(selectedOrder.id, s)}
                                            className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all ${selectedOrder.status === s ? 'bg-admin-primary border-admin-primary text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-admin-primary'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Shipment Info */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</h4>
                                <div className="bg-gray-50 p-6 space-y-2">
                                    <p className="text-sm font-bold text-gray-900">
                                        {selectedOrder.customerName || `${selectedOrder.firstName || ''} ${selectedOrder.lastName || ''}` || 'Unknown Ritualist'}
                                    </p>
                                    <div className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
                                        <p>{selectedOrder.shippingAddress?.address || selectedOrder.address || 'Address not manifested'}</p>
                                        <p>
                                            {selectedOrder.shippingAddress?.city || selectedOrder.city || ''}
                                            {(selectedOrder.shippingAddress?.city || selectedOrder.city) && (selectedOrder.shippingAddress?.pincode || selectedOrder.pincode) ? ', ' : ''}
                                            {selectedOrder.shippingAddress?.pincode || selectedOrder.pincode || ''}
                                        </p>
                                        <p>India</p>
                                    </div>
                                    <p className="text-xs font-bold text-admin-primary pt-4">
                                        {selectedOrder.phone || 'No Contact Number'}
                                    </p>
                                </div>
                            </div>

                            {/* Item Manifest */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Constituent Items</h4>
                                <div className="space-y-6">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 grayscale group-hover:grayscale-0 transition-all overflow-hidden">
                                                    <img src={item.imageUrl || item.image || "//public/default-images/generic.svg"} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.quantity} x ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">₹{item.quantity * item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ritual Total</span>
                                <span className="text-2xl font-serif text-gray-900 font-bold">₹{(selectedOrder.totalAmount || selectedOrder.total)?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
