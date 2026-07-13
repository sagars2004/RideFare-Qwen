"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CreditCard, MapPin, History, Settings, LogOut } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const email = "admin@ridefare.com";
        const [profRes, bookRes] = await Promise.all([
          fetch(`http://localhost:8000/api/user/profile?email=${email}`),
          fetch(`http://localhost:8000/api/user/bookings?email=${email}`)
        ]);
        if (profRes.ok) setProfile(await profRes.json());
        if (bookRes.ok) setBookings((await bookRes.json()).bookings);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] font-sans text-black flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 flex gap-8 h-[calc(100vh-80px)]">
        
        {/* Sidebar (Fixed Height) */}
        <div className="w-[320px] shrink-0 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col h-full">
           <div className="flex items-center gap-4 mb-8">
             <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
               <ArrowLeft size={20} />
             </button>
             <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
           </div>
           
           <nav className="flex flex-col gap-2 flex-1">
             <button 
               onClick={() => setActiveTab('overview')}
               className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-colors ${activeTab === 'overview' ? 'bg-black text-white shadow-md' : 'hover:bg-gray-50 text-gray-500'}`}
             >
               <User size={18} /> Overview
             </button>
             <button 
               onClick={() => setActiveTab('rides')}
               className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-colors ${activeTab === 'rides' ? 'bg-black text-white shadow-md' : 'hover:bg-gray-50 text-gray-500'}`}
             >
               <History size={18} /> Recent Rides
             </button>
             <button 
               className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-colors hover:bg-gray-50 text-gray-400 cursor-not-allowed`}
             >
               <Settings size={18} /> Settings
             </button>
           </nav>
           
           <div className="mt-auto pt-6 border-t border-gray-100">
             <button 
                onClick={() => {
                  setUser(null);
                  router.push('/');
                }}
                className="flex items-center justify-center gap-2 w-full py-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm"
             >
                <LogOut size={18} /> Sign Out
             </button>
           </div>
        </div>

        {/* Content Area (Scrollable) */}
        <div className="flex-1 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm overflow-y-auto h-full">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><User size={24} /> Personal Info</h2>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Full Name</label>
                    <input type="text" defaultValue={profile?.name} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">State</label>
                    <input type="text" defaultValue={profile?.state} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <button className="w-full mt-4 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                    Save Changes
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CreditCard size={24} /> Payment Methods</h2>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white font-black italic px-3 py-1.5 rounded-md text-sm shadow-sm">VISA</div>
                    <span className="font-bold tracking-widest text-gray-800 text-lg">•••• {profile?.cc_last4}</span>
                  </div>
                  <button className="text-blue-600 text-sm font-bold hover:underline px-4 py-2 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rides' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><History size={24} /> Recent Rides</h2>
              
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                  <MapPin size={48} className="mb-4 opacity-50" />
                  <p className="font-semibold text-lg text-gray-600">No rides booked yet.</p>
                  <p className="text-sm mt-1">Head back to the homepage to book your first ride!</p>
                  <button onClick={() => router.push('/')} className="mt-6 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">Book a ride</button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookings.map((booking, i) => (
                    <div key={i} className="p-6 border border-gray-100 rounded-2xl hover:border-black transition-colors group flex justify-between items-center bg-gray-50 hover:bg-white hover:shadow-md cursor-pointer">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-xl capitalize">{booking.provider}</span>
                          <span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{booking.tier}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                          <MapPin size={16} className="text-gray-400" /> {booking.pickup} <ArrowLeft size={14} className="rotate-180 text-gray-300" /> {booking.dropoff}
                        </div>
                        <div className="text-xs text-gray-400 font-mono font-medium">
                          {new Date(booking.date).toLocaleString()}
                        </div>
                      </div>
                      <div className="font-black text-3xl group-hover:scale-105 transition-transform">
                        ${booking.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
