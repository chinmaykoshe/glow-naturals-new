import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HiOutlineViewGrid,
    HiOutlineShoppingBag,
    HiOutlineClipboardList,
    HiOutlineUsers,
    HiOutlineCube,
    HiOutlinePhotograph,
    HiOutlineMail,
    HiOutlineChatAlt,
    HiOutlineHome,
    HiX
} from 'react-icons/hi';

const menuItems = [
    { name: 'Dashboard', icon: HiOutlineViewGrid, path: '/admin' },
    { name: 'Products', icon: HiOutlineShoppingBag, path: '/admin/products' },
    { name: 'Categories', icon: HiOutlineCube, path: '/admin/categories' },
    { name: 'Inventory', icon: HiOutlineCube, path: '/admin/inventory' },
    { name: 'Orders', icon: HiOutlineClipboardList, path: '/admin/orders' },
    { name: 'Users', icon: HiOutlineUsers, path: '/admin/users' },
    { name: 'Hero Section', icon: HiOutlinePhotograph, path: '/admin/hero' },
    { name: 'Messages', icon: HiOutlineMail, path: '/admin/messages' },
    { name: 'Reviews', icon: HiOutlineChatAlt, path: '/admin/reviews' },
];

function AdminSidebar({ isOpen, setIsOpen }) {
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden animate-fadeIn"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 flex flex-col z-[70] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/glownaturalslogo.png"
                            alt="Glow Naturals Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <h1 className="font-serif font-bold text-gray-900 tracking-tight">
                            Admin Portal
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-gray-400 hover:text-gray-900"
                    >
                        <HiX size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${isActive
                                    ? 'bg-admin-primary/10 text-admin-primary'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                    >
                        <HiOutlineHome size={20} />
                        Main Site
                    </Link>
                </div>
            </div>
        </>
    );
}

export default AdminSidebar;
