"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AutocompleteInput from "@/components/AutocompleteInput";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";

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
            <div className="flex flex-col items-center w-max">
              <h1 className="text-[56px] font-bold leading-tight tracking-[-0.04em]">
                Go anywhere with
              </h1>
              <div>
                <HandWrittenTitle title="RideFare." />
              </div>
            </div>
            <p className="text-gray-500 text-[15px] mt-8 mb-8 leading-relaxed">
              A multi-agent ride-hailing negotiation system that produces explainable, personalized ride recommendations using autonomous provider agents coordinated through competitive bid negotiation on Qwen Cloud.
            </p>
            
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

          {/* Right Panel: Animated Map Graphic */}
          <div className="hidden lg:flex flex-1 h-full items-center justify-end relative">
            <div className="w-full max-w-[550px] aspect-square bg-[#F9F9F9] rounded-[40px] border-[8px] border-black relative overflow-hidden shadow-2xl flex items-center justify-center">
              {/* City Grid */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#E5E5E5 2px, transparent 2px), linear-gradient(90deg, #E5E5E5 2px, transparent 2px)',
                backgroundSize: '50px 50px',
                backgroundPosition: '-2px -2px'
              }}></div>
              
              {/* Animated Routes */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Main Route */}
                <path d="M -50 150 L 150 150 L 150 350 L 300 350 L 300 100 L 450 100 L 450 450 L 600 450" fill="none" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
                <circle r="10" fill="#000">
                  <animateMotion dur="14s" repeatCount="indefinite" path="M -50 150 L 150 150 L 150 350 L 300 350 L 300 100 L 450 100 L 450 450 L 600 450" />
                </circle>

                {/* Secondary Route */}
                <path d="M 600 250 L 400 250 L 400 400 L 200 400 L 200 50 L -50 50" fill="none" stroke="#000" strokeWidth="4" strokeLinejoin="round" strokeDasharray="8 8" opacity="0.4" />
                <circle r="6" fill="#000" opacity="0.6">
                  <animateMotion dur="18s" repeatCount="indefinite" path="M 600 250 L 400 250 L 400 400 L 200 400 L 200 50 L -50 50" />
                </circle>

                {/* Third Route */}
                <path d="M 250 -50 L 250 200 L 50 200 L 50 500 L -50 500" fill="none" stroke="#000" strokeWidth="4" strokeLinejoin="round" strokeDasharray="4 8" opacity="0.3" />
                <circle r="5" fill="#000" opacity="0.5">
                  <animateMotion dur="22s" repeatCount="indefinite" path="M 250 -50 L 250 200 L 50 200 L 50 500 L -50 500" />
                </circle>
                
                {/* Fourth Route */}
                <path d="M 550 50 L 350 50 L 350 300 L 100 300 L 100 600" fill="none" stroke="#000" strokeWidth="3" strokeLinejoin="round" strokeDasharray="6 6" opacity="0.3" />
                <circle r="4" fill="#000" opacity="0.6">
                  <animateMotion dur="16s" repeatCount="indefinite" path="M 550 50 L 350 50 L 350 300 L 100 300 L 100 600" />
                </circle>
                
                {/* Fifth Route */}
                <path d="M -50 550 L 500 550 L 500 200 L 600 200" fill="none" stroke="#000" strokeWidth="2" strokeLinejoin="round" opacity="0.5" />
                <circle r="7" fill="#000" opacity="0.8">
                  <animateMotion dur="20s" repeatCount="indefinite" path="M -50 550 L 500 550 L 500 200 L 600 200" />
                </circle>

                {/* Animated Location Hubs (Corners) */}
                {[
                  [150, 150], [150, 350], [300, 350], [300, 100], [450, 100], [450, 450],
                  [400, 250], [400, 400], [200, 400], [200, 50], [250, 200], [50, 200],
                  [50, 500], [350, 50], [350, 300], [100, 300], [500, 550], [500, 200]
                ].map(([x, y], i) => (
                  <g key={i} transform={`translate(${x}, ${y})`}>
                    <circle r="6" fill="#000" />
                    {i % 2 === 0 && (
                      <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#000" strokeWidth="1.5" opacity="0.4">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="90" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" />
                      </rect>
                    )}
                  </g>
                ))}
                
                {/* Ping Animations at key Hubs */}
                <circle cx="150" cy="150" r="15" fill="none" stroke="#000" strokeWidth="2" opacity="0">
                  <animate attributeName="opacity" values="0.6; 0; 0" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="r" values="6; 25; 25" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="450" cy="100" r="15" fill="none" stroke="#000" strokeWidth="2" opacity="0">
                  <animate attributeName="opacity" values="0; 0.6; 0" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="r" values="6; 30; 30" dur="5s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="350" r="15" fill="none" stroke="#000" strokeWidth="2" opacity="0">
                  <animate attributeName="opacity" values="0; 0; 0.6; 0" dur="6s" repeatCount="indefinite" />
                  <animate attributeName="r" values="6; 6; 25; 25" dur="6s" repeatCount="indefinite" />
                </circle>

                {/* Central HQ / Main Data Hub at bottom center */}
                <g transform="translate(275, 450)">
                  {/* Connection lines to the network */}
                  <path d="M 0 15 L 0 100" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
                  <path d="M 25 -100 L 25 -20" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
                  
                  {/* Pulse behind */}
                  <circle r="25" fill="#000" opacity="0">
                    <animate attributeName="r" values="20; 40; 20" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15; 0; 0.15" dur="3s" repeatCount="indefinite" />
                  </circle>
                  
                  {/* Spinning outer square */}
                  <rect x="-15" y="-15" width="30" height="30" fill="none" stroke="#000" strokeWidth="3">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="90" dur="5s" repeatCount="indefinite" />
                  </rect>

                  {/* Inner static square */}
                  <rect x="-8" y="-8" width="16" height="16" fill="#000" />
                </g>
              </svg>
            </div>
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

      {/* Footer */}
      <footer className="w-full bg-black text-white py-10 px-12 mt-auto">
        <div className="max-w-[1150px] mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p className="font-medium tracking-wide">&copy; 2026 RideFare. Built on Qwen Cloud.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Agents</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
