"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AutocompleteInput from "@/components/AutocompleteInput";

export default function Home() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const handleRequestRide = () => {
    const params = new URLSearchParams();
    if (pickup) params.set("pickup", pickup);
    if (dropoff) params.set("dropoff", dropoff);
    if (specialRequests) params.set("requests", specialRequests);
    
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black overflow-x-hidden flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-12 font-bold text-3xl tracking-tighter">RideFare</header>

      {/* Main Hero Section */}
      <main className="max-w-[1150px] w-full mx-auto pt-10 px-6 pb-20 flex-1">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 h-full items-center">
          
          {/* Left Panel: Booking Form */}
          <div className="w-full lg:w-[480px] shrink-0">
            <h1 className="text-[56px] font-bold leading-tight mb-8 tracking-[-0.04em]">
              Go anywhere with RideFare
            </h1>
            
            <div className="mb-6">
              <button className="bg-[#EEEEEE] hover:bg-[#E2E2E2] text-black font-medium py-2.5 px-4 rounded-full flex items-center gap-2 transition-colors mb-6 text-[15px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.8L11 11.6V6h2v4.6l4.4 4.4-1.2 1.8z"/>
                </svg>
                Pickup now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              
              <div className="relative flex flex-col gap-3">
                {/* Connecting Line */}
                <div className="absolute left-[22.5px] top-[24px] bottom-[24px] w-[2px] bg-gray-300 z-0"></div>
                
                <div className="relative z-10 flex items-center">
                  <div className="absolute left-4 flex justify-center items-center w-6 h-6 z-10">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                  <AutocompleteInput
                    placeholder="Pickup location"
                    value={pickup}
                    onChange={setPickup}
                    className="pl-12"
                    showCurrentLocation={true}
                  />
                </div>

                <div className="relative z-10 flex items-center">
                  <div className="absolute left-4 flex justify-center items-center w-6 h-6 z-10">
                    <div className="w-[10px] h-[10px] bg-black"></div>
                  </div>
                  <AutocompleteInput
                    placeholder="Dropoff location"
                    value={dropoff}
                    onChange={setDropoff}
                    className="pl-12"
                  />
                </div>
              </div>

              <div className="pt-3">
                <input
                  type="text"
                  placeholder="Special requests (e.g. No Robotaxis, arrive by 7pm)"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-[#F3F3F3] border-none rounded-lg p-4 text-base outline-none placeholder-gray-500 font-medium focus:ring-2 focus:ring-black transition-shadow"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-6">
              <button
                onClick={handleRequestRide}
                disabled={!pickup && !specialRequests}
                className="bg-black text-white font-medium py-3.5 px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors text-base"
              >
                See prices
              </button>
              <button className="text-black font-medium hover:underline text-[15px]">
                Log in to see your recent activity
              </button>
            </div>
          </div>

          {/* Right Panel: Hero Image permanently */}
          <div className="flex-1 w-full h-[500px] relative rounded-xl overflow-hidden shadow-sm">
            <img 
              src="/hero.png" 
              alt="Travel luggage" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Explore Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-8 tracking-tight">Explore what you can do with RideFare</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F3F3F3] rounded-2xl p-6 h-48 relative overflow-hidden group cursor-pointer">
              <h3 className="text-xl font-bold mb-2">Ride</h3>
              <p className="text-sm text-gray-600 max-w-[180px]">Go anywhere with RideFare. Request a ride, hop in, and go.</p>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-200 rounded-full group-hover:scale-110 transition-transform"></div>
            </div>
            <div className="bg-[#F3F3F3] rounded-2xl p-6 h-48 relative overflow-hidden group cursor-pointer">
              <h3 className="text-xl font-bold mb-2">Reserve</h3>
              <p className="text-sm text-gray-600 max-w-[180px]">Reserve your ride in advance so you can relax on the day of your trip.</p>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-200 rounded-full group-hover:scale-110 transition-transform"></div>
            </div>
            <div className="bg-[#F3F3F3] rounded-2xl p-6 h-48 relative overflow-hidden group cursor-pointer">
              <h3 className="text-xl font-bold mb-2">Rental Cars</h3>
              <p className="text-sm text-gray-600 max-w-[180px]">Your perfect rental car is a few clicks away.</p>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-200 rounded-full group-hover:scale-110 transition-transform"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
