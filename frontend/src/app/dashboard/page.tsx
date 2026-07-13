"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CreditCard, MapPin, History, Settings, LogOut, Bookmark, Shield } from "lucide-react";
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
    <div className="min-h-screen bg-white font-sans text-black flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 flex gap-8 h-[calc(100vh-80px)]">
        
        {/* Sidebar (Fixed Height) */}
        <div className="w-[320px] shrink-0 bg-white rounded-3xl p-6 border-[4px] border-black flex flex-col h-full">
           <div className="flex items-center gap-4 mb-8">
             <button onClick={() => router.back()} className="p-2 border-[2px] border-transparent hover:border-black rounded-full transition-colors">
               <ArrowLeft size={20} />
             </button>
             <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
           </div>
           
           <nav className="flex flex-col gap-2 flex-1">
             <button 
               onClick={() => setActiveTab('overview')}
               className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all border-[2px] ${activeTab === 'overview' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-transparent hover:border-black hover:text-black'}`}
             >
               <User size={18} /> Overview
             </button>
             <button 
               onClick={() => setActiveTab('rides')}
               className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all border-[2px] ${activeTab === 'rides' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-transparent hover:border-black hover:text-black'}`}
             >
               <History size={18} /> Recent Rides
             </button>
             <button 
               onClick={() => setActiveTab('locations')}
               className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all border-[2px] ${activeTab === 'locations' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-transparent hover:border-black hover:text-black'}`}
             >
               <Bookmark size={18} /> Saved Locations
             </button>
             <button 
               onClick={() => setActiveTab('security')}
               className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all border-[2px] ${activeTab === 'security' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-transparent hover:border-black hover:text-black'}`}
             >
               <Shield size={18} /> Security
             </button>
             <button 
               className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all border-[2px] bg-white text-gray-400 border-transparent cursor-not-allowed`}
             >
               <Settings size={18} /> Settings
             </button>
           </nav>
           
           <div className="mt-auto pt-6 border-t-2 border-black">
             <button 
                onClick={() => {
                  setUser(null);
                  router.push('/');
                }}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black border-[2px] border-black font-bold rounded-xl hover:bg-black hover:text-white transition-all active:scale-95"
             >
                <LogOut size={18} /> Sign Out
             </button>
           </div>
        </div>

        {/* Content Area (Scrollable) */}
        <div className="flex-1 bg-white rounded-3xl p-8 border-[4px] border-black overflow-y-auto h-full">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><User size={24} /> Personal Info</h2>
                <div className="bg-white rounded-2xl p-6 border-[2px] border-black flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Full Name</label>
                    <input type="text" defaultValue={profile?.name} className="w-full bg-[#F3F3F3] border-none rounded-lg p-4 text-base outline-none placeholder-gray-500 font-medium focus:ring-2 focus:ring-black transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">State</label>
                    <input type="text" defaultValue={profile?.state} className="w-full bg-[#F3F3F3] border-none rounded-lg p-4 text-base outline-none placeholder-gray-500 font-medium focus:ring-2 focus:ring-black transition-shadow" />
                  </div>
                  <button className="w-full mt-4 py-3 bg-black text-white border-[2px] border-black font-bold rounded-xl hover:bg-white hover:text-black transition-all active:scale-95">
                    Save Changes
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CreditCard size={24} /> Payment Methods</h2>
                <div className="bg-white border-[2px] border-black rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-black text-white font-black italic px-3 py-1.5 rounded-md text-sm">VISA</div>
                    <span className="font-bold tracking-widest text-black text-lg">•••• {profile?.cc_last4}</span>
                  </div>
                  <button className="text-black text-sm font-bold border-[2px] border-transparent hover:border-black px-4 py-2 rounded-lg transition-all">Edit</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rides' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><History size={24} /> Recent Rides</h2>
              
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-black bg-white rounded-2xl border-[2px] border-black border-dashed">
                  <MapPin size={48} className="mb-4 opacity-100" />
                  <p className="font-bold text-lg text-black">No rides booked yet.</p>
                  <p className="text-sm mt-1 font-medium text-gray-500">Head back to the homepage to book your first ride!</p>
                  <button onClick={() => router.push('/')} className="mt-6 px-6 py-3 bg-black text-white border-[2px] border-black font-bold rounded-xl hover:bg-white hover:text-black transition-all active:scale-95">Book a ride</button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookings.map((booking, i) => (
                    <div key={i} className="p-6 border-[2px] border-black rounded-2xl transition-all group flex justify-between items-center bg-white hover:-translate-y-1 cursor-pointer">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-xl capitalize">{booking.provider}</span>
                          <span className="bg-black text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{booking.tier}</span>
                        </div>
                        <div className="text-sm text-black flex items-center gap-2 font-bold">
                          <MapPin size={16} className="text-black" /> {booking.pickup} <ArrowLeft size={14} className="rotate-180 text-black" /> {booking.dropoff}
                        </div>
                        <div className="text-xs text-gray-500 font-mono font-bold">
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

          {activeTab === 'locations' && (
            <div className="flex flex-col gap-8 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Bookmark size={24} /> Saved Locations</h2>
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl p-5 border-[2px] border-black flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-black text-white p-2 rounded-lg">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Home</div>
                        <div className="text-sm font-medium text-gray-600">6244 Sun River Drive, Sacramento CA 95824</div>
                      </div>
                    </div>
                    <button className="text-black text-sm font-bold border-[2px] border-transparent hover:border-black px-4 py-2 rounded-lg transition-all">Edit</button>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border-[2px] border-black flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-black text-white p-2 rounded-lg">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Work</div>
                        <div className="text-sm font-medium text-gray-600">3835 Oakes Drive, Hayward CA 94542</div>
                      </div>
                    </div>
                    <button className="text-black text-sm font-bold border-[2px] border-transparent hover:border-black px-4 py-2 rounded-lg transition-all">Edit</button>
                  </div>
                  <button className="w-full mt-2 py-3 bg-white text-black border-[2px] border-black border-dashed font-bold rounded-xl hover:bg-black hover:border-solid hover:text-white transition-all active:scale-95">
                    + Add New Location
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex flex-col gap-8 max-w-2xl">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Shield size={24} /> Security Settings</h2>
                <div className="bg-white rounded-2xl p-6 border-[2px] border-black flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-[#F3F3F3] border-none rounded-lg p-4 text-base outline-none placeholder-gray-500 font-medium focus:ring-2 focus:ring-black transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">New Password</label>
                    <input type="password" placeholder="Enter new password" className="w-full bg-[#F3F3F3] border-none rounded-lg p-4 text-base outline-none placeholder-gray-500 font-medium focus:ring-2 focus:ring-black transition-shadow" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-black border-dashed">
                    <div>
                      <div className="font-bold">Two-Factor Authentication</div>
                      <div className="text-sm font-medium text-gray-500">Add an extra layer of security to your account.</div>
                    </div>
                    <button className="px-4 py-2 bg-black text-white font-bold rounded-xl border-[2px] border-black active:scale-95 transition-transform">
                      Enable
                    </button>
                  </div>
                  <button className="w-full mt-2 py-3 bg-black text-white border-[2px] border-black font-bold rounded-xl hover:bg-white hover:text-black transition-all active:scale-95">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
