import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AdminSidebar from './AdminSidebar';
import { HiMenuAlt2 } from 'react-icons/hi';

function AdminLayout() {
    const [isAdmin, setIsAdmin] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    navigate('/');
                }
            } else {
                navigate('/auth');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <p className="font-serif italic text-gray-300 text-xl md:text-2xl">Authenticating authority...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white md:flex">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="/glownaturalslogo.png"
                        alt="Glow Naturals Logo"
                        className="w-8 h-8 object-contain"
                    />
                    <h1 className="font-serif font-bold text-gray-900 tracking-tight">
                        Admin
                    </h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-400 hover:text-gray-900"
                >
                    <HiMenuAlt2 size={24} />
                </button>
            </header>

            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 md:ml-64 p-6 md:p-10 bg-white">
                <div className="max-w-6xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
