import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function Dashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        lowStock: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Orders & Revenue
                const ordersSnapshot = await getDocs(collection(db, "orders"));
                let totalRevenue = 0;
                ordersSnapshot.forEach(doc => {
                    const data = doc.data();
                    totalRevenue += Number(data.totalAmount || 0);
                });

                // Customers
                const usersSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "customer")));

                // Low Stock (Assuming stock < 5)
                const productsSnapshot = await getDocs(collection(db, "products"));
                let lowStockCount = 0;
                productsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.stock < 5) lowStockCount++;
                });

                setStats({
                    revenue: totalRevenue,
                    orders: ordersSnapshot.size,
                    customers: usersSnapshot.size,
                    lowStock: lowStockCount
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="py-32 text-center text-gray-300 font-serif italic text-xl">Aggregating essence...</div>;
    }

    return (
        <div className="space-y-12">
            <div>
                <span className="text-admin-primary text-[10px] font-bold uppercase tracking-[0.5em] block mb-2">Overview</span>
                <h1 className="text-5xl font-serif text-gray-900 tracking-tighter">Admin Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
                {[
                    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}` },
                    { label: 'Total Orders', value: stats.orders },
                    { label: 'Total Customers', value: stats.customers },
                    { label: 'Low Stock Items', value: stats.lowStock },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-10 border border-gray-100 space-y-4">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-4xl font-serif text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
