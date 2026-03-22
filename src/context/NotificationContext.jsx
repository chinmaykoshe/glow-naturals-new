import React, { createContext, useContext, useState, useCallback } from "react";
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiOutlineX } from "react-icons/hi";

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used within a NotificationProvider");
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const showNotification = useCallback((message, type = "success", duration = 3000) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);

        if (duration !== Infinity) {
            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }, duration);
        }
    }, []);

    const confirm = useCallback((message, title = "Are you sure?") => {
        return new Promise((resolve) => {
            setConfirmDialog({
                message,
                title,
                resolve
            });
        });
    }, []);

    const handleConfirmClose = (result) => {
        if (confirmDialog) {
            confirmDialog.resolve(result);
            setConfirmDialog(null);
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification, confirm }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed top-24 right-6 md:right-12 z-[200] space-y-4 max-w-sm w-full">
                {notifications.map((n) => (
                    <div 
                        key={n.id}
                        className={`bg-[#111111] text-white p-5 shadow-2xl flex items-start gap-4 animate-in slide-in-from-right-10 duration-500 border-l-2 ${
                            n.type === "error" ? "border-red-500" : n.type === "info" ? "border-blue-500" : "border-admin-primary"
                        }`}
                    >
                        <div className="pt-0.5">
                            {n.type === "error" ? (
                                <HiOutlineExclamationCircle className="text-red-500" size={18} />
                            ) : n.type === "info" ? (
                                <HiOutlineInformationCircle className="text-blue-500" size={18} />
                            ) : (
                                <HiOutlineCheckCircle className="text-admin-primary" size={18} />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">{n.type === "error" ? "Action Required" : "System Update"}</p>
                            <p className="text-xs font-medium leading-relaxed uppercase tracking-tighter text-gray-200">{n.message}</p>
                        </div>
                        <button 
                            onClick={() => setNotifications((prev) => prev.filter((noti) => noti.id !== n.id))}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <HiOutlineX size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Global Confirm Dialog */}
            {confirmDialog && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => handleConfirmClose(false)}></div>
                    <div className="bg-white w-full max-w-md p-10 md:p-12 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <span className="text-admin-primary text-[9px] font-bold uppercase tracking-[0.4em] block text-center italic">Confirmation Requested</span>
                                <h3 className="text-3xl font-serif text-gray-900 tracking-tighter text-center leading-none">{confirmDialog.title}</h3>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest text-center leading-relaxed italic">{confirmDialog.message}</p>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleConfirmClose(false)}
                                    className="flex-1 border border-gray-200 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleConfirmClose(true)}
                                    className="flex-1 bg-gray-900 text-white py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-admin-primary transition-all shadow-xl"
                                >
                                    Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
