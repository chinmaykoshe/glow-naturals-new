import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { HiOutlineTrash, HiOutlineChatAlt2 } from 'react-icons/hi';

function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "messages"));
            const m = [];
            querySnapshot.forEach((doc) => {
                m.push({ id: doc.id, ...doc.data() });
            });
            setMessages(m.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Archive this communication permanentely?")) {
            await deleteDoc(doc(db, "messages", id));
            fetchMessages();
        }
    };

    return (
        <div className="space-y-12">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Divine Communication</span>
                <h1 className="text-5xl font-serif text-gray-900 tracking-tighter">Messages</h1>
            </div>

            <div className="space-y-1">
                {messages.map((msg) => (
                    <div key={msg.id} className="bg-white p-12 border border-gray-100 group relative rounded-none hover:border-admin-primary transition-all">
                        <button
                            onClick={() => handleDelete(msg.id)}
                            className="absolute top-12 right-12 text-gray-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-2"
                        >
                            <HiOutlineTrash size={20} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                            <div className="md:col-span-3 space-y-8">
                                <div className="flex items-center gap-2 text-admin-primary">
                                    <HiOutlineChatAlt2 size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Inquiry</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">Ritualist</p>
                                        <p className="text-lg font-serif text-gray-900 leading-tight">{msg.name || 'Anonymous'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">Contact Email</p>
                                        <p className="text-sm text-gray-500 font-medium break-all">{msg.email}</p>
                                    </div>
                                    {msg.phone && (
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">Phone</p>
                                            <p className="text-sm text-gray-500 font-medium">{msg.phone}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">Manifested At</p>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() :
                                                msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : 'Ancient'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-9 border-l border-gray-50 pl-16">
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-6 px-1">Message Content</p>
                                <div className="text-2xl text-gray-600 leading-relaxed font-serif italic bg-beige-50/30 p-8 border-l-4 border-admin-primary/10">
                                    "{msg.message}"
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && !loading && (
                    <div className="p-40 text-center text-gray-300 border border-dashed border-gray-100">
                        <p className="font-serif italic text-2xl">The communication stream is silent.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminMessages;
