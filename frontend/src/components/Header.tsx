"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, setUser, showAuthModal, setShowAuthModal } = useAuth();
  
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        const profileRes = await fetch(`/api/user/profile?email=${data.email}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser({ ...profileData, email: data.email });
          setShowAuthModal(false);
        }
      } else {
        setAuthError("Invalid email or password");
      }
    } catch (err) {
      setAuthError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <header className="w-full bg-black text-white py-5 px-12 border-b border-gray-800 shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-12 text-lg font-medium text-gray-300">
            <Link href="/" className="font-bold text-3xl tracking-tighter cursor-pointer text-white">RideFare</Link>
            <nav className="hidden md:flex gap-12">
              <span className="hover:text-white cursor-pointer transition-colors">Features</span>
              <span className="hover:text-white cursor-pointer transition-colors">How it Works</span>
              <span className="hover:text-white cursor-pointer transition-colors">Partners</span>
            </nav>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 pl-12">
            <span className="flex items-center gap-2 text-gray-300"><Globe size={20} /> EN • USD</span>
            
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-3 hover:text-white cursor-pointer bg-gray-900 px-4 py-2 rounded-full border border-gray-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <span className="font-semibold text-sm">{user.name}</span>
              </Link>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="hover:bg-gray-200 cursor-pointer font-bold bg-white text-black px-6 py-2 rounded-full transition-transform hover:scale-105">
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

    {/* Auth Modal */}
    {showAuthModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white text-black rounded-3xl p-8 max-w-sm w-full border-[4px] border-black relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-2 relative z-10">Sign in to RideFare</h2>
          <p className="text-gray-500 text-sm mb-6 relative z-10">Sign in to book your ride and save your payment methods.</p>
          
          <form onSubmit={handleLogin} className="relative z-10 flex flex-col gap-4 mb-4">
            {authError && <div className="text-red-500 text-sm font-medium">{authError}</div>}
            <div>
              <label className="block text-sm font-bold text-black mb-1">Email</label>
              <input 
                type="email" 
                required
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full bg-[#F3F3F3] border-none rounded-lg p-4 text-base outline-none placeholder-gray-500 font-medium focus:ring-2 focus:ring-black transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Password</label>
              <input 
                type="password" 
                required
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                className="w-full bg-[#F3F3F3] border-none rounded-lg p-4 text-base outline-none placeholder-gray-500 font-medium focus:ring-2 focus:ring-black transition-shadow"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-4 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-transform active:scale-95 disabled:opacity-50 border-[2px] border-black"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <button 
            onClick={() => setShowAuthModal(false)}
            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors relative z-10 border-[2px] border-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </>
);
}
