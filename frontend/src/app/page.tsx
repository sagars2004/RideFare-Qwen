"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<any>(null);
  const [traceVisibleIndex, setTraceVisibleIndex] = useState(-1);

  const handleRequestRide = async () => {
    setLoading(true);
    setDecision(null);
    setTraceVisibleIndex(-1);

    // Combine structured fields into a single natural language intent for the Constraint Agent
    const intent = `Pickup: ${pickup}. Dropoff: ${dropoff}. ${specialRequests}`;

    try {
      const res = await fetch("http://localhost:8000/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rider_intent: intent }),
      });
      const data = await res.json();
      setDecision(data);
    } catch (err) {
      console.error(err);
      alert("Failed to negotiate ride. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (decision && decision.negotiation_trace) {
      const interval = setInterval(() => {
        setTraceVisibleIndex((prev) => {
          if (prev < decision.negotiation_trace.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 1500); // 1.5s per trace line fade in
      return () => clearInterval(interval);
    }
  }, [decision]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* Header (optional minimal header could go here) */}

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-6 lg:p-12 gap-12">
        {/* Left panel: Input (Uber.com style) */}
        <div className="w-full md:w-[450px] flex flex-col shrink-0 pt-8">
          <h1 className="text-5xl font-bold mb-8 tracking-tight text-black">
            Go anywhere with RideFare
          </h1>
          
          <div className="space-y-4 mb-6">
            <button className="bg-gray-100 hover:bg-gray-200 text-black font-medium py-2.5 px-4 rounded-full flex items-center gap-2 transition-colors w-fit">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Pickup now
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            <div className="relative flex flex-col gap-2">
              {/* Vertical line connecting the dots */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-300 z-0"></div>
              
              <div className="relative z-10 flex items-center">
                <div className="absolute left-4 w-2 h-2 bg-black rounded-full"></div>
                <input
                  type="text"
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-gray-100 border-none rounded-lg p-3.5 pl-10 text-base focus:ring-2 focus:ring-black outline-none placeholder-gray-500"
                />
                <div className="absolute right-4 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </div>
              </div>

              <div className="relative z-10 flex items-center">
                <div className="absolute left-3.5 w-3 h-3 border-2 border-black bg-white"></div>
                <input
                  type="text"
                  placeholder="Dropoff location"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full bg-gray-100 border-none rounded-lg p-3.5 pl-10 text-base focus:ring-2 focus:ring-black outline-none placeholder-gray-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Special Requests / Preferences</label>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black outline-none resize-none placeholder-gray-400"
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="E.g. No Robotaxis, I don't trust them. Need to arrive by 7:15 PM."
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-2">
            <button
              onClick={handleRequestRide}
              disabled={loading || (!pickup && !specialRequests)}
              className="bg-black text-white font-semibold py-3.5 px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Negotiating..." : "See prices"}
            </button>
            <button className="text-gray-900 font-medium hover:bg-gray-100 py-2 px-4 rounded-lg transition-colors text-sm">
              Log in to see your recent activity
            </button>
          </div>
        </div>

        {/* Right panel: Results & Trace OR Promo Image */}
        <div className="flex-1 w-full bg-gray-50 rounded-2xl overflow-hidden relative min-h-[500px]">
          {decision ? (
            <div className="absolute inset-0 overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
              {/* Negotiation Trace Panel */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Live Negotiation Trace
                </h2>
                <div className="space-y-3 font-mono text-sm">
                  {decision.negotiation_trace.map((traceLine: string, idx: number) => (
                    <div
                      key={idx}
                      className={`transition-all duration-1000 p-3 rounded-lg ${
                        idx <= traceVisibleIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 hidden"
                      } ${
                        traceLine.includes("Constraint Agent") ? "bg-red-50 text-red-700" :
                        traceLine.includes("Coordinator") ? "bg-green-50 text-green-700" :
                        "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {traceLine}
                    </div>
                  ))}
                  {traceVisibleIndex < decision.negotiation_trace.length - 1 && (
                    <div className="text-gray-400 animate-pulse mt-2 p-3">...</div>
                  )}
                </div>
                
                {traceVisibleIndex === decision.negotiation_trace.length - 1 && (
                  <div className="mt-6 p-4 bg-gray-900 text-white rounded-xl transition-opacity duration-1000 opacity-100">
                    <p className="font-semibold text-sm mb-1">Coordinator Rationale</p>
                    <p className="text-sm opacity-90">{decision.rationale}</p>
                  </div>
                )}
              </div>

              {/* Results List */}
              <div className="bg-white rounded-2xl shadow-sm p-2 border border-gray-100 transition-opacity duration-1000">
                <h2 className="text-lg font-bold p-4 pb-2">Recommended Rides</h2>
                <div className="divide-y divide-gray-100">
                  {/* Render Ranked Options */}
                  {decision.rank.map((provider: string, idx: number) => (
                    <div key={provider} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${idx === 0 ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 capitalize">
                          {provider.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold capitalize text-lg flex items-center gap-2">
                            {provider}
                            {idx === 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">Best Choice</span>}
                          </div>
                          <div className="text-sm text-gray-500">Selected based on your preferences</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Render Excluded Options */}
                  {decision.excluded.map((exc: any) => (
                    <div key={exc.provider} className="p-4 flex items-center justify-between opacity-50 bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-400 capitalize">
                          {exc.provider.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold capitalize text-lg text-gray-500 line-through">
                            {exc.provider}
                          </div>
                          <div className="text-sm text-red-500 font-medium">
                            Excluded: {exc.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-yellow-400 flex flex-col items-center justify-center text-center p-8">
               <h3 className="text-3xl font-bold text-black mb-4">Ready to travel?</h3>
               <p className="text-black font-medium opacity-80 mb-6">Enter your pickup and dropoff to let our agents negotiate the best fare.</p>
               {loading && <div className="animate-pulse font-bold bg-black text-white px-6 py-3 rounded-full">Agents Negotiating...</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
