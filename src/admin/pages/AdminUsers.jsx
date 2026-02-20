import React, { useState, useEffect } from 'react';
import { auth, db, functions } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { HiOutlineTrash, HiOutlineUserGroup, HiOutlineShieldCheck } from 'react-icons/hi';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
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
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Sever this user's connection to the archive?")) {
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

    const toggleRole = async (id, currentRole) => {
        const newRole = currentRole === 'admin' ? 'customer' : 'admin';
        try {
            await updateDoc(doc(db, "users", id), { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    return (
        <div className="space-y-12">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Social Fabric</span>
                <h1 className="text-5xl font-serif text-gray-900 tracking-tighter">User Directory</h1>
            </div>

            <div className="bg-white border border-gray-100 rounded-none overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ritualist</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Presence</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Sanction</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 flex items-center justify-center font-bold text-gray-300 border border-gray-100">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{user.displayName || 'Unnamed'}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">ID: {user.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <button
                                        onClick={() => toggleRole(user.id, user.role)}
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
                {users.length === 0 && !loading && (
                    <div className="p-32 text-center text-gray-300">
                        <p className="font-serif italic text-2xl">The archive is silent.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminUsers;
