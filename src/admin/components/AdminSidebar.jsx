import React, { useState } from 'react';
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
    HiX,
    HiChevronDoubleLeft,
    HiChevronDoubleRight
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

function AdminSidebar({ isOpen, setIsOpen, isMinimized, setIsMinimized }) {
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

            <div className={`${isMinimized ? 'w-20' : 'w-64'} h-screen bg-white border-r border-gray-100 fixed left-0 top-0 flex flex-col z-[70] transition-all duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className={`p-6 border-b border-gray-50 flex items-center ${isMinimized ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <img
                            src="/glownaturalslogo.png"
                            alt="Glow Naturals Logo"
                            className="w-8 h-8 object-contain shrink-0"
                        />
                        {!isMinimized && (
                            <h1 className="font-serif font-bold text-gray-900 tracking-tight whitespace-nowrap">
                                Admin Portal
                            </h1>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-gray-400 hover:text-gray-900"
                    >
                        <HiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-visible custom-scrollbar">
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-4 px-3 py-3 text-[10px] font-bold uppercase tracking-widest transition-all group relative z-10 hover:z-50 ${isActive
                                        ? 'bg-admin-primary/10 text-admin-primary'
                                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                        } ${isMinimized ? 'justify-center px-0' : ''}`}
                                >
                                    <item.icon size={20} className="shrink-0" />
                                    {!isMinimized ? (
                                        <span>{item.name}</span>
                                    ) : (
                                        <div className="fixed left-20 ml-2 px-3 py-2 bg-gray-900 text-white rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-all invisible group-hover:visible whitespace-nowrap z-[100] scale-95 group-hover:scale-100 origin-left duration-200 shadow-xl border border-white/10">
                                            {item.name}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-50 space-y-2">
                    <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all group relative z-10 hover:z-50 ${isMinimized ? 'justify-center px-0' : ''}`}
                    >
                        <HiOutlineHome size={20} className="shrink-0" />
                        {!isMinimized ? (
                            <span>Main Site</span>
                        ) : (
                            <div className="fixed left-20 ml-2 px-3 py-2 bg-gray-900 text-white rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-all invisible group-hover:visible whitespace-nowrap z-[100] scale-95 group-hover:scale-100 origin-left duration-200 shadow-xl border border-white/10">
                                Main Site
                            </div>
                        )}
                    </Link>

                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className={`hidden md:flex w-full items-center gap-4 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all group relative z-10 hover:z-50 ${isMinimized ? 'justify-center px-0' : ''}`}
                    >
                        {isMinimized ? <HiChevronDoubleRight size={20} /> : <HiChevronDoubleLeft size={20} />}
                        {!isMinimized ? (
                            <span>Collapse</span>
                        ) : (
                            <div className="fixed left-20 ml-2 px-3 py-2 bg-gray-900 text-white rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-all invisible group-hover:visible whitespace-nowrap z-[100] scale-95 group-hover:scale-100 origin-left duration-200 shadow-xl border border-white/10">
                                Expand
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

export default AdminSidebar;
