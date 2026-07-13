"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AutocompleteInput from "@/components/AutocompleteInput";
import { HandWrittenTitle } from "@/components/ui/hand-writing-text";
import Header from "@/components/Header";
import { Clock, Search, MapPin, ChevronRight, Scale, Users, Bot, Zap, Filter, Car, Globe, Cpu } from "lucide-react";

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
      <Header />

      {/* Main Hero Section */}
      <main className="max-w-[1300px] w-full mx-auto pt-10 px-6 pb-20 flex-1">
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
            <p className="text-gray-500 text-[15px] mt-8 mb-8 leading-relaxed max-w-[600px] relative z-10 pt-4">
              Stop endlessly toggling between ride apps. RideFare's AI agents automatically negotiate 
              with providers like Uber and Lyft in real-time to find your perfect ride based on price, 
              ETA, and your personal preferences— so you don't have to endlessly hop between apps.
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
          <div className="hidden lg:flex flex-1 h-full items-center justify-end relative pl-8">
            <div className="w-full max-w-[750px] aspect-[4/3] bg-[#F5F5F5] rounded-[40px] border-[8px] border-black relative overflow-hidden shadow-2xl flex items-center justify-center">
              
              {/* Ultra-Clean Minimalist Grid Background */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                backgroundSize: '100px 100px',
                backgroundPosition: '50px 50px'
              }}></div>
              
              {/* Minimalist Map SVG */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 550 550" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                
                {/* Defined Street Outlines (Base pass for borders, Top pass for inner streets) */}
                <g strokeLinecap="round" strokeLinejoin="round" fill="none">
                  
                  {/* Border Pass */}
                  <g stroke="#E0E0E0" strokeWidth="26">
                    <path d="M 100 -50 L 100 200 L 300 200 L 300 450 L 600 450" />
                    <path d="M 250 -50 L 250 100 L 450 100 L 450 600" />
                    <path d="M -50 350 L 200 350 L 200 600" />
                    <path d="M 50 -50 L 50 100 L 150 100 L 150 450 L -50 450" />
                    <path d="M 350 300 L 500 300 L 500 -50" />
                    <path d="M -50 200 L 100 200" />
                    <path d="M 300 200 L 300 -50" />
                    <path d="M 200 350 L 600 350" />
                  </g>
                  
                  {/* Inner Street Pass */}
                  <g stroke="#F8F8F8" strokeWidth="20">
                    <path d="M 100 -50 L 100 200 L 300 200 L 300 450 L 600 450" />
                    <path d="M 250 -50 L 250 100 L 450 100 L 450 600" />
                    <path d="M -50 350 L 200 350 L 200 600" />
                    <path d="M 50 -50 L 50 100 L 150 100 L 150 450 L -50 450" />
                    <path d="M 350 300 L 500 300 L 500 -50" />
                    <path d="M -50 200 L 100 200" />
                    <path d="M 300 200 L 300 -50" />
                    <path d="M 200 350 L 600 350" />
                  </g>
                </g>

                {/* Dynamic Routing Paths & Vehicles */}
                <g fill="none" strokeLinejoin="round">
                  {/* Route 1 */}
                  <path d="M 100 -50 L 100 200 L 300 200 L 300 450 L 600 450" stroke="#000" strokeWidth="4" />
                  <circle r="6" fill="#000">
                    <animateMotion dur="8s" repeatCount="indefinite" path="M 100 -50 L 100 200 L 300 200 L 300 450 L 600 450" />
                  </circle>

                  {/* Route 2 */}
                  <path d="M 250 -50 L 250 100 L 450 100 L 450 600" stroke="#000" strokeWidth="3" strokeDasharray="8 6" opacity="0.6" />
                  <circle r="5" fill="#000">
                    <animateMotion dur="9s" repeatCount="indefinite" path="M 250 -50 L 250 100 L 450 100 L 450 600" />
                  </circle>

                  {/* Route 3 */}
                  <path d="M -50 350 L 200 350 L 200 600" stroke="#000" strokeWidth="4" opacity="0.8" />
                  <circle r="5" fill="#000">
                    <animateMotion dur="6s" repeatCount="indefinite" path="M -50 350 L 200 350 L 200 600" />
                  </circle>

                  {/* Route 4 */}
                  <path d="M 50 -50 L 50 100 L 150 100 L 150 450 L -50 450" stroke="#000" strokeWidth="2" opacity="0.3" />
                  <circle r="4" fill="#000">
                    <animateMotion dur="10s" repeatCount="indefinite" path="M 50 -50 L 50 100 L 150 100 L 150 450 L -50 450" />
                  </circle>

                  {/* Route 5 */}
                  <path d="M 500 -50 L 500 300 L 350 300" stroke="#000" strokeWidth="3" strokeDasharray="4 4" opacity="0.5" />
                  <circle r="6" fill="#000">
                    <animateMotion dur="7s" repeatCount="indefinite" path="M 500 -50 L 500 300 L 350 300" />
                  </circle>

                  {/* Route 6 */}
                  <path d="M 200 350 L 600 350" stroke="#000" strokeWidth="3" opacity="0.4" />
                  <circle r="5" fill="#000">
                    <animateMotion dur="5s" repeatCount="indefinite" path="M 200 350 L 600 350" />
                  </circle>
                  
                  {/* High-speed straight lines */}
                  <path d="M 300 200 L 300 -50" stroke="#000" strokeWidth="2" opacity="0.1" />
                  <rect width="3" height="15" fill="#000" rx="1.5" opacity="0.5">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 300 200 L 300 -50" />
                  </rect>
                  <path d="M 100 200 L -50 200" stroke="#000" strokeWidth="2" opacity="0.1" />
                  <rect width="15" height="3" fill="#000" rx="1.5" opacity="0.5">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 100 200 L -50 200" />
                  </rect>
                </g>

                {/* Pristine Intersections / Nodes */}
                
                {/* Node: 100, 200 */}
                <g transform="translate(100, 200)">
                  <circle r="14" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" />
                  <circle r="6" fill="#000" />
                </g>

                {/* Node: 300, 200 */}
                <g transform="translate(300, 200)">
                  <circle r="22" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" />
                  <circle r="10" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="3 3">
                     <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                  </circle>
                  <circle r="4" fill="#000" />
                </g>

                {/* Node: 450, 100 */}
                <g transform="translate(450, 100)">
                  <circle r="8" fill="#FFF" stroke="#000" strokeWidth="2" />
                </g>

                {/* Node: 200, 350 */}
                <g transform="translate(200, 350)">
                  <circle r="26" fill="none" stroke="#000" strokeWidth="1" opacity="0.1">
                    <animate attributeName="r" values="10; 35; 10" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3; 0; 0.3" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle r="16" fill="#FFF" stroke="#E0E0E0" strokeWidth="2" />
                  <circle r="6" fill="#000" />
                </g>

                {/* Node: 300, 450 */}
                <g transform="translate(300, 450)">
                  <circle r="12" fill="#FFF" stroke="#000" strokeWidth="3" />
                  <circle r="3" fill="#000" />
                </g>

                {/* Node: 500, 300 */}
                <g transform="translate(500, 300)">
                  <circle r="18" fill="#000" />
                  <circle r="6" fill="#FFF" />
                </g>

              </svg>
            </div>
          </div>
        </div>

        {/* Explore Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-10 tracking-tight text-center">Explore what you can do with RideFare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#F3F3F3] rounded-2xl p-6 h-48 relative overflow-hidden group cursor-pointer">
              <h3 className="text-xl font-bold mb-2">Autonomous Agents</h3>
              <p className="text-sm text-gray-600 max-w-[180px]">Our AI agents negotiate directly with providers in real-time to secure the best possible fare.</p>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-200 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center"><Bot size={40} className="text-gray-800" strokeWidth={1.5} /></div>
            </div>
            <div className="bg-[#F3F3F3] rounded-2xl p-6 h-48 relative overflow-hidden group cursor-pointer">
              <h3 className="text-xl font-bold mb-2">Smart Trade-offs</h3>
              <p className="text-sm text-gray-600 max-w-[180px]">Agents perfectly balance ETA, price, and vehicle type to match your exact travel preferences.</p>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-200 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center"><Scale size={40} className="text-gray-800" strokeWidth={1.5} /></div>
            </div>
            <div className="bg-[#F3F3F3] rounded-2xl p-6 h-48 relative overflow-hidden group cursor-pointer">
              <h3 className="text-xl font-bold mb-2">Full Transparency</h3>
              <p className="text-sm text-gray-600 max-w-[180px]">No black boxes. See exactly why a specific ride was chosen with clear, explainable reasoning.</p>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-200 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center"><Search size={40} className="text-gray-800" strokeWidth={1.5} /></div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 relative">
          <h2 className="text-3xl font-bold mb-16 tracking-tight text-center">Stop switching between different apps to find the best rideshare price.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (desktop only) */}
            <div className="hidden md:block absolute top-[40px] left-[17%] right-[17%] h-[3px] bg-black">
              {/* Animated Traveling Dot */}
              <div 
                className="absolute top-1/2 w-4 h-4 bg-black rounded-full shadow-lg"
                style={{
                  animation: 'travel-dot 3s infinite ease-in-out'
                }}
              ></div>
              <style>{`
                @keyframes travel-dot {
                  0% { left: 0%; transform: translate(-50%, -50%); opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { left: 100%; transform: translate(-50%, -50%); opacity: 0; }
                }
              `}</style>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white">1</span>
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Set your terms</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-[280px]">
                Enter your pickup, dropoff, and any strict preferences like "Cheapest possible" or "Robotaxi only".
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white">2</span>
                <Cpu size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Agents negotiate</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-[280px]">
                Our multi-agent system simultaneously queries rideshare APIs and autonomous fleets to find matches.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl relative">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white">3</span>
                <Car size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Choose and ride</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-[280px]">
                Review the transparent, ranked options and book your perfect ride with a single click.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Providers Section */}
        <div className="mt-24 mb-4">
          <h2 className="text-3xl font-bold mb-12 tracking-tight text-center">Supported Mobility Providers</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {/* Uber Logo Typography */}
            <div className="font-medium tracking-tighter text-4xl text-black">Uber</div>
            {/* Lyft Logo Typography */}
            <div className="font-bold tracking-tighter text-4xl text-[#FF00BF]">lyft</div>
            {/* Waymo Logo Typography */}
            <div className="font-bold tracking-widest text-3xl text-[#00A69C]">W<span className="text-xl">AYMO</span></div>
            {/* Zoox */}
            <div className="font-black tracking-widest text-3xl text-[#FF8A00]">ZOOX</div>
            {/* Tesla */}
            <div className="font-black tracking-tighter text-3xl text-gray-800">Robotaxi</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-10 px-12 mt-auto">
        <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row justify-between items-center text-lg text-gray-300">
          <p className="font-medium tracking-wide">&copy; 2026 RideFare. All Rights Reserved.</p>
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
