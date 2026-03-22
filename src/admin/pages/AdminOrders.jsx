import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { HiOutlineX, HiOutlineDotsVertical, HiOutlineEye, HiOutlineTrash, HiOutlineBell } from 'react-icons/hi';
import { useNotification } from '../../context/NotificationContext';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { showNotification, confirm: customConfirm } = useNotification();

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
            const sorted = o.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setOrders(sorted);
            setFilteredOrders(sorted);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search')?.toLowerCase();
        if (search) {
            setFilteredOrders(orders.filter(o =>
                o.id?.toLowerCase().includes(search) ||
                o.customerName?.toLowerCase().includes(search) ||
                o.email?.toLowerCase().includes(search) ||
                o.status?.toLowerCase().includes(search) ||
                o.phone?.toLowerCase().includes(search)
            ));
        } else {
            setFilteredOrders(orders);
        }
    }, [location.search, orders]);

    const [trackingInfo, setTrackingInfo] = useState({ trackingId: '', carrier: '' });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const updateStatus = async (id, status, extraData = {}) => {
        setIsActionLoading(true);
        try {
            const updateData = { status, ...extraData };
            await updateDoc(doc(db, "orders", id), updateData);

            // Send email notification
            const order = orders.find(o => o.id === id);
            if (order) {
                try {
                    await fetch('/.netlify/functions/sendOrderEmail', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: order.email,
                            orderId: id,
                            total: order.totalAmount || order.total,
                            status: status,
                            customerName: order.customerName || `${order.firstName || ''} ${order.lastName || ''}`,
                            items: order.items,
                            shippingAddress: {
                                address: order.shippingAddress?.address || order.address,
                                city: order.shippingAddress?.city || order.city,
                                pincode: order.shippingAddress?.pincode || order.pincode,
                                phone: order.phone
                            },
                            trackingId: extraData.trackingId || order.trackingId,
                            deliveryPartner: extraData.deliveryPartner || order.deliveryPartner
                        })
                    });
                } catch (emailError) {
                    console.error("Failed to send status update email:", emailError);
                }
            }

            fetchOrders();
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, ...updateData });
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const proceed = await customConfirm("Are you sure you want to archive this order permanently? This cannot be undone.", "Archive Order");
        if (!proceed) return;

        try {
            await deleteDoc(doc(db, "orders", id));
            showNotification("Order archived successfully.", "success");
            fetchOrders();
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            showNotification("Failed to archive order.", "error");
        }
    };

    const sendReminder = async (order) => {
        setIsActionLoading(true);
        try {
            await fetch('/.netlify/functions/sendOrderEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: order.email,
                    orderId: order.id,
                    total: order.totalAmount || order.total,
                    status: order.status || 'pending',
                    customerName: order.customerName || `${order.firstName || ''} ${order.lastName || ''}`,
                    items: order.items,
                    shippingAddress: {
                        address: order.shippingAddress?.address || order.address,
                        city: order.shippingAddress?.city || order.city,
                        pincode: order.shippingAddress?.pincode || order.pincode,
                        phone: order.phone
                    },
                    trackingId: order.trackingId,
                    deliveryPartner: order.deliveryPartner
                })
            });
            showNotification("Status reminder sent to customer.", "success");
        } catch (error) {
            console.error("Failed to send reminder:", error);
            showNotification("Unable to send email reminder.", "error");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 relative min-h-[90vh] pb-64">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Management</span>
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tighter">Orders</h1>
            </div>

            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block bg-white border border-gray-100 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Ref</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="px-8 py-5 font-mono text-[10px] text-gray-400">#{order.id.slice(0, 10).toUpperCase()}</td>
                                <td className="px-8 py-5">
                                    <div className="text-sm font-bold text-gray-900">
                                        {order.customerName || (order.email ? order.email.split('@')[0] : 'Customer')}
                                    </div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{order.email}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="space-y-2 max-w-[250px]">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item, idx) => (
                                                <div key={idx} className="text-[10px] font-bold text-gray-900 uppercase leading-tight">
                                                    {item.name}
                                                    <span className="text-admin-primary ml-1 whitespace-nowrap">x{item.quantity}</span>
                                                </div>
                                            ))
                                        ) : 'No items'}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-[10px] font-bold text-gray-900 uppercase">
                                        {order.shippingAddress?.city || order.city || 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-gray-400">{order.shippingAddress?.pincode || order.pincode || ''}</div>
                                </td>
                                <td className="px-8 py-5 text-sm font-bold text-gray-900">₹{(order.totalAmount || order.total)?.toLocaleString()}</td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[9px] font-bold px-3 py-1 uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-50 text-admin-primary' :
                                            order.status === 'processing' ? 'bg-blue-50 text-blue-600' : 
                                            order.status === 'cancelled' ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {order.status || 'pending'}
                                        </span>
                                        {order.cancellationRequested && (
                                            <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest text-center animate-pulse">Cancel requested</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right flex justify-end gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => sendReminder(order)}
                                            className="text-orange-300 hover:text-orange-500 transition-all p-2"
                                            title="Send Payment Reminder"
                                        >
                                            <HiOutlineBell size={18} />
                                        </button>
                                    )}
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
            </div>

            {/* Mobile Card View - Visible only on Small Screens */}
            <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-100 p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">#{order.id.slice(0, 10).toUpperCase()}</p>
                                <p className="font-bold text-gray-900">
                                    {order.customerName || (order.email ? order.email.split('@')[0] : 'Customer')}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase">{order.email}</p>
                            </div>
                                 <div className="flex flex-col gap-1 items-end">
                                    <span className={`text-[8px] font-bold px-2 py-1 uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-50 text-admin-primary' :
                                        order.status === 'processing' ? 'bg-blue-50 text-blue-600' : 
                                        order.status === 'cancelled' ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {order.status || 'pending'}
                                    </span>
                                    {order.cancellationRequested && (
                                        <span className="text-[7px] font-bold text-red-500 uppercase animate-pulse">Cancel Req</span>
                                    )}
                                </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <p className="font-bold text-gray-900">₹{(order.totalAmount || order.total)?.toLocaleString()}</p>
                                    <div className="flex gap-2">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => sendReminder(order)}
                                                className="p-2 text-orange-400"
                                            >
                                                <HiOutlineBell size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2 text-gray-400 hover:text-admin-primary"
                                        >
                                            <HiOutlineEye size={20} />
                                        </button>
                                <button
                                    onClick={() => handleDelete(order.id)}
                                    className="p-2 text-gray-400 hover:text-red-500"
                                >
                                    <HiOutlineTrash size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 && !loading && (
                <div className="py-20 md:p-32 text-center text-gray-300">
                    <p className="font-serif italic text-xl">No orders found.</p>
                </div>
            )}

            {/* Order Details Sliding Modal - Responsive */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative w-full md:max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 md:relative z-10">
                            <div>
                                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-1">Details</span>
                                <h2 className="text-xl md:text-2xl font-serif text-gray-900">Order #{selectedOrder.id.slice(0, 10).toUpperCase()}</h2>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-900 transition-all p-2">
                                <HiOutlineX size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 md:space-y-12">
                            {/* Status Orchestration */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update Order Status</h4>
                                    {isActionLoading && <span className="text-[9px] font-bold text-admin-primary animate-pulse uppercase tracking-widest">Updating...</span>}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {['pending', 'shipped', 'cancelled', 'delivered'].map((s) => (
                                        <button
                                            key={s}
                                            disabled={isActionLoading || (s === 'shipped' && selectedOrder.status === 'shipped')}
                                            onClick={() => updateStatus(selectedOrder.id, s)}
                                            className={`flex-1 min-w-[22%] py-3 text-[9px] font-bold uppercase tracking-widest border transition-all ${selectedOrder.status === s ? 'bg-admin-primary border-admin-primary text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-admin-primary'} ${s === 'shipped' && selectedOrder.status === 'shipped' ? 'cursor-default' : ''}`}
                                        >
                                            {s === 'shipped' ? 'Handover' : s}
                                        </button>
                                    ))}
                                </div>

                                {selectedOrder.cancellationRequested && (
                                    <div className="p-6 bg-red-50 border border-red-100 space-y-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-red-500"></div>
                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Cancellation Request Received</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => updateStatus(selectedOrder.id, 'cancelled', { cancellationRequested: false })}
                                                className="flex-1 bg-red-600 text-white py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                                            >
                                                Approve Cancellation
                                            </button>
                                            <button 
                                                onClick={() => updateDoc(doc(db, "orders", selectedOrder.id), { cancellationRequested: false }).then(() => fetchOrders())}
                                                className="flex-1 bg-white border border-gray-200 text-gray-500 py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                                            >
                                                Deny Request
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedOrder.status === 'pending' && (
                                    <div className="space-y-4 bg-gray-50 p-5 md:p-6 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-3 bg-admin-primary"></div>
                                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Handover Details</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">Carrier</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. BlueDart"
                                                    className="w-full text-xs p-3 border border-gray-200 focus:outline-none focus:border-admin-primary bg-white"
                                                    value={trackingInfo.carrier}
                                                    onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] text-gray-400 uppercase font-bold tracking-tight">TID</label>
                                                <input
                                                    type="text"
                                                    placeholder="TID123..."
                                                    className="w-full text-xs p-3 border border-gray-200 focus:outline-none focus:border-admin-primary bg-white"
                                                    value={trackingInfo.trackingId}
                                                    onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingId: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            disabled={isActionLoading}
                                            onClick={() => {
                                                if (!trackingInfo.carrier || !trackingInfo.trackingId) {
                                                     showNotification("Enter both carrier and tracking ID to proceed.", "info");
                                                     return;
                                                }
                                                updateStatus(selectedOrder.id, 'shipped', {
                                                    deliveryPartner: trackingInfo.carrier,
                                                    trackingId: trackingInfo.trackingId
                                                });
                                                setTrackingInfo({ trackingId: '', carrier: '' });
                                            }}
                                            className="w-full py-4 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-admin-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isActionLoading ? 'Processing...' : 'Confirm Handover'}
                                        </button>
                                    </div>
                                )}

                                {selectedOrder.trackingId && (
                                    <div className="border-l-4 border-admin-primary/20 pl-4 py-4 bg-admin-primary/5">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shipping via</p>
                                        <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{selectedOrder.deliveryPartner}</p>
                                        <p className="text-[10px] text-admin-primary font-bold uppercase tracking-widest mt-1">TID: {selectedOrder.trackingId}</p>
                                    </div>
                                )}
                            </div>

                            {/* Shipment Info */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shipping Address</h4>
                                <div className="bg-gray-50 p-6 space-y-2">
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                                        {selectedOrder.customerName || (selectedOrder.email ? selectedOrder.email.split('@')[0] : 'Customer')}
                                    </p>
                                    <div className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
                                        <p>{selectedOrder.shippingAddress?.address || selectedOrder.address}</p>
                                        <p>
                                            {selectedOrder.shippingAddress?.city || selectedOrder.city}
                                            {", "}{selectedOrder.shippingAddress?.pincode || selectedOrder.pincode}
                                        </p>
                                        <p>India</p>
                                    </div>
                                    <p className="text-xs font-bold text-admin-primary pt-4">
                                        {selectedOrder.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</h4>
                                <div className="space-y-6">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 overflow-hidden">
                                                    <img src={item.imageUrl || item.image || "/default-product.png"} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-xs md:text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
                                                    <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest">{item.quantity} x ₹{item.price}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">₹{item.quantity * item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 mt-auto">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Total</span>
                                <span className="text-xl md:text-2xl font-serif text-gray-900 font-bold">₹{(selectedOrder.totalAmount || selectedOrder.total)?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
