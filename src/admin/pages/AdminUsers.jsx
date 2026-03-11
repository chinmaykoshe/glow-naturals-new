import React, { useState, useEffect } from 'react';
import { auth, db, functions } from '../../firebase';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { HiOutlineTrash, HiOutlineShieldCheck } from 'react-icons/hi';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [deletingUserId, setDeletingUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const u = [];
            querySnapshot.forEach((doc) => {
                u.push({ id: doc.id, ...doc.data() });
            });
            setUsers(u);
            setFilteredUsers(u);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search')?.toLowerCase();
        if (search) {
            setFilteredUsers(users.filter(u =>
                u.displayName?.toLowerCase().includes(search) ||
                u.email?.toLowerCase().includes(search) ||
                u.id?.toLowerCase().includes(search) ||
                u.phone?.toLowerCase().includes(search)
            ));
        } else {
            setFilteredUsers(users);
        }
    }, [location.search, users]);

    const handleDeleteUser = async (id) => {
        if (window.confirm("Permanently delete this user's account?")) {
            if (auth.currentUser?.uid === id) {
                window.alert("You cannot delete your own admin account.");
                return;
            }

            setDeletingUserId(id);
            try {
                const deleteUserAccount = httpsCallable(functions, "deleteUserAccount");
                await deleteUserAccount({ uid: id });
                fetchUsers();
            } catch (error) {
                console.error("Error permanently deleting user:", error);
                window.alert(
                    "Failed to permanently delete user from Authentication. Ensure Firebase Function is deployed."
                );
            } finally {
                setDeletingUserId(null);
            }
        }
    };

    const toggleRole = async (id, currentRole, displayName) => {
        const newRole = currentRole === 'admin' ? 'customer' : 'admin';
        const name = displayName || 'this user';

        if (window.confirm(`Are you sure you want to make ${name} a ${newRole}?`)) {
            try {
                await updateDoc(doc(db, "users", id), { role: newRole });
                fetchUsers();
            } catch (error) {
                console.error("Error updating user role:", error);
            }
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 min-h-[90vh] pb-64">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Accounts</span>
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tighter">User Directory</h1>
            </div>

            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block bg-white border border-gray-100 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 flex items-center justify-center font-bold text-gray-300 border border-gray-100 uppercase">
                                            {user.email?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {user.displayName && user.displayName !== 'Unnamed'
                                                    ? user.displayName
                                                    : (user.email ? user.email.split('@')[0] : 'Guest')}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {user.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <button
                                        onClick={() => {
                                            const name = user.displayName && user.displayName !== 'Unnamed'
                                                ? user.displayName
                                                : (user.email ? user.email.split('@')[0] : 'Guest');
                                            toggleRole(user.id, user.role, name);
                                        }}
                                        className={`text-[9px] font-bold px-3 py-1 uppercase tracking-widest flex items-center gap-1 ${user.role === 'admin' ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {user.role === 'admin' ? <HiOutlineShieldCheck size={12} /> : null}
                                        {user.role || 'customer'}
                                    </button>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="text-sm text-gray-900">{user.email}</p>
                                    <p className="text-[10px] font-bold text-admin-primary tracking-widest">{user.phone || 'NO PHONE'}</p>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        disabled={deletingUserId === user.id}
                                        className="text-gray-300 hover:text-red-500 transition-all p-2"
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
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white border border-gray-100 p-5 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center font-bold text-gray-300 border border-gray-100 uppercase">
                                    {user.email?.[0] || '?'}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-gray-900">
                                        {user.displayName && user.displayName !== 'Unnamed'
                                            ? user.displayName
                                            : (user.email ? user.email.split('@')[0] : 'Guest')}
                                    </p>
                                    <button
                                        onClick={() => {
                                            const name = user.displayName && user.displayName !== 'Unnamed'
                                                ? user.displayName
                                                : (user.email ? user.email.split('@')[0] : 'Guest');
                                            toggleRole(user.id, user.role, name);
                                        }}
                                        className={`text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-1 ${user.role === 'admin' ? 'bg-admin-primary text-white' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {user.role === 'admin' ? <HiOutlineShieldCheck size={10} /> : null}
                                        {user.role || 'customer'}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingUserId === user.id}
                                className="text-gray-300 hover:text-red-500 p-2"
                            >
                                <HiOutlineTrash size={20} />
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex flex-col gap-1">
                            <p className="text-xs font-medium text-gray-500">{user.email}</p>
                            <p className="text-[10px] font-bold text-admin-primary tracking-[0.2em]">{user.phone || 'NO PHONE RECORDED'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && !loading && (
                <div className="py-20 md:p-32 text-center text-gray-300">
                    <p className="font-serif italic text-xl md:text-2xl">No users found.</p>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
