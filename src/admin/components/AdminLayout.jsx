import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AdminSidebar from './AdminSidebar';
import { HiMenuAlt2, HiOutlineSearch, HiX } from 'react-icons/hi';

function AdminLayout() {
    const [isAdmin, setIsAdmin] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

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

    // Sync search query with URL params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchQuery(params.get('search') || "");
    }, [location.search]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        const params = new URLSearchParams(location.search);
        if (query.trim()) {
            params.set('search', query);
        } else {
            params.delete('search');
        }
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    if (isAdmin === null) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <p className="font-serif italic text-gray-300 text-xl md:text-2xl">Authenticating authority...</p>
            </div>
        );
    }

    const pageTitle = location.pathname.split('/').pop()?.toUpperCase() || 'DASHBOARD';

    return (
        <div className="min-h-screen bg-white md:flex">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-50">
                <div className="flex items-center justify-between mb-4">
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
                </div>
                {/* Mobile Search Bar */}
                <div className="relative group">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-admin-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder={`Search ${pageTitle.toLowerCase()}...`}
                        className="w-full bg-gray-50 border-none rounded-none py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-admin-primary/20 outline-none transition-all"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => {
                                setSearchQuery("");
                                const params = new URLSearchParams(location.search);
                                params.delete('search');
                                navigate(`${location.pathname}?${params.toString()}`, { replace: true });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900"
                        >
                            <HiX size={14} />
                        </button>
                    )}
                </div>
            </header>

            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main className="flex-1 md:ml-64 bg-white min-h-screen">
                {/* Desktop Search Header */}
                <header className="hidden md:flex sticky top-0 bg-white/80 backdrop-blur-md z-40 px-10 py-6 border-b border-gray-100 items-center justify-between gap-8">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 whitespace-nowrap">
                        {pageTitle}
                    </h2>
                    
                    <div className="max-w-md w-full relative group">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-admin-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${pageTitle.toLowerCase()}...`}
                            className="w-full bg-transparent border-b border-transparent hover:border-gray-100 focus:border-admin-primary py-2 pl-12 pr-8 text-sm outline-none transition-all placeholder:text-gray-300"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => {
                                    setSearchQuery("");
                                    const params = new URLSearchParams(location.search);
                                    params.delete('search');
                                    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
                                }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900"
                            >
                                <HiX size={16} />
                            </button>
                        )}
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-6 md:p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
