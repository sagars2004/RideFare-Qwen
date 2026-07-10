"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const pickup = searchParams.get("pickup") || "";
  const dropoff = searchParams.get("dropoff") || "";
  const specialRequests = searchParams.get("requests") || "";
  
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<any>(null);
  const [traceVisibleIndex, setTraceVisibleIndex] = useState(-1);
  const [providerData, setProviderData] = useState<Record<string, any>>({});

  // Helper for branded logos
  const getProviderLogo = (providerName: string, isExcluded: boolean = false) => {
    const name = providerName.toLowerCase();
    
    if (name === 'uber') return <div className={`font-medium tracking-tighter text-2xl ${isExcluded ? 'text-gray-400' : 'text-black'}`}>Uber</div>;
    if (name === 'lyft') return <div className={`font-bold tracking-tighter text-2xl ${isExcluded ? 'text-gray-400' : 'text-[#FF00BF]'}`}>lyft</div>;
    if (name === 'waymo') return <div className={`font-bold tracking-widest text-lg ${isExcluded ? 'text-gray-400' : 'text-[#00A69C]'}`}>W<span className="text-sm">AYMO</span></div>;
    return <div className={`font-mono font-bold text-lg ${isExcluded ? 'text-gray-400' : 'text-gray-800'}`}>ROBO</div>;
  };

  // Generate dynamic randomized prices/ETAs on mount
  useEffect(() => {
    setProviderData({
      uber: { price: `$${(35 + Math.random() * 15).toFixed(2)}`, eta: `${Math.floor(2 + Math.random() * 6)} mins away`, capacity: 4, badge: "Popular" },
      lyft: { price: `$${(30 + Math.random() * 15).toFixed(2)}`, eta: `${Math.floor(4 + Math.random() * 7)} mins away`, capacity: 4, badge: "Good deal" },
      waymo: { price: `$${(45 + Math.random() * 20).toFixed(2)}`, eta: `${Math.floor(8 + Math.random() * 10)} mins away`, capacity: 4, badge: "Premium AV" },
      robotaxi: { price: `$${(20 + Math.random() * 10).toFixed(2)}`, eta: `${Math.floor(12 + Math.random() * 15)} mins away`, capacity: 2, badge: "Cheapest" }
    });
  }, [pickup, dropoff]);

  useEffect(() => {
    const fetchNegotiation = async () => {
      const intent = `Pickup: ${pickup}. Dropoff: ${dropoff}. ${specialRequests}`;
      try {
        const res = await fetch("http://localhost:8000/api/negotiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            rider_intent: intent,
            request_context: { pickup, dropoff, requests: specialRequests }
          }),
        });
        const data = await res.json();
        setDecision(data);
      } catch (err) {
        console.error(err);
        setDecision({ detail: "Failed to connect to backend." });
      } finally {
        setLoading(false);
      }
    };
    if (pickup || dropoff || specialRequests) {
      fetchNegotiation();
    } else {
      setLoading(false);
    }
  }, [pickup, dropoff, specialRequests]);

  useEffect(() => {
    if (decision && !decision.detail) {
      const interval = setInterval(() => {
        setTraceVisibleIndex((prev) => {
          if (prev < 4) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [decision]);

  return (
    <div className="min-h-screen bg-white font-sans text-black flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-8 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link href="/" className="font-bold text-2xl tracking-tighter hover:opacity-70 transition-opacity">RideFare</Link>
        <div className="flex gap-6 font-medium text-[15px]">
          <span className="border-b-2 border-black pb-1 cursor-pointer">Ride</span>
          <span className="text-gray-500 hover:text-black cursor-pointer transition-colors">Rental Cars</span>
          <span className="text-gray-500 hover:text-black cursor-pointer transition-colors">Activity</span>
        </div>
      </header>

      <main className="flex-1 flex w-full max-w-[1400px] mx-auto p-6 gap-8">
        
        {/* Left Column (Inputs) */}
        <div className="w-[320px] shrink-0 flex flex-col gap-6">
          <h2 className="text-2xl font-bold">Get a ride</h2>
          <div className="bg-[#F3F3F3] rounded-xl p-4 flex flex-col gap-3">
            <div className="relative flex items-center">
              <div className="absolute left-3 w-2 h-2 bg-black rounded-full"></div>
              <div className="w-full bg-white rounded p-2.5 pl-8 text-sm truncate font-medium border border-gray-200">{pickup || "Current Location"}</div>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-[8px] h-[8px] bg-black"></div>
              <div className="w-full bg-white rounded p-2.5 pl-8 text-sm truncate font-medium border border-gray-200">{dropoff || "Destination"}</div>
            </div>
            {specialRequests && (
               <div className="mt-2 text-xs text-gray-500 px-1 font-medium bg-gray-200/50 p-2 rounded">{specialRequests}</div>
            )}
          </div>
          
          <div className="flex items-center justify-between p-3.5 bg-[#F3F3F3] hover:bg-gray-200 transition-colors rounded-xl cursor-pointer">
            <div className="flex items-center gap-3 font-medium text-[15px]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              Pickup now
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
          </div>

          <button 
            onClick={() => router.push('/')}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Edit search
          </button>
        </div>

        {/* Middle Column (Results) */}
        <div className="flex-1 max-w-[450px] flex flex-col pr-8 border-r border-gray-100">
          <h2 className="text-[32px] font-bold mb-1 tracking-tight">Choose a ride</h2>
          <p className="text-sm text-gray-500 mb-6">Negotiated by multi-agent system</p>
          
          <div className="flex-1 overflow-y-auto">
            {loading || (decision && traceVisibleIndex < 4) ? (
              <div className="flex flex-col items-center justify-center h-48">
                 <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="font-bold animate-pulse">Agents Negotiating...</p>
              </div>
            ) : decision?.detail ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
                <h3 className="font-bold mb-2">Backend Error</h3>
                <p className="text-sm">{decision.detail}</p>
              </div>
            ) : decision?.rank ? (
              <div className="flex flex-col gap-3">
                {/* Ranked Options */}
                {decision.rank.map((provider: string, idx: number) => {
                  const data = providerData[provider.toLowerCase()] || { price: "$40.00", eta: "10 mins away", capacity: 4, badge: "" };
                  
                  return (
                    <div key={provider} className={`p-4 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${idx === 0 ? 'border-black bg-white shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        {/* Car Icon Placeholder */}
                        <div className="w-[70px] h-[50px] shrink-0 relative flex items-center justify-center">
                          {getProviderLogo(provider)}
                        </div>
                        
                        <div className="flex flex-col">
                          <div className="font-bold capitalize text-lg flex items-center gap-1.5">
                            {provider}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            <span className="text-sm">{data.capacity}</span>
                          </div>
                          <div className="text-[13px] text-gray-500 font-medium">
                             {data.eta} • 1:35 PM
                          </div>
                          {idx === 0 ? (
                            <div className="mt-1"><span className="bg-blue-600 text-white text-[11px] px-1.5 py-0.5 rounded font-bold">{data.badge}</span></div>
                          ) : data.badge === "Cheapest" ? (
                            <div className="mt-1"><span className="bg-green-600 text-white text-[11px] px-1.5 py-0.5 rounded font-bold">{data.badge}</span></div>
                          ) : null}
                        </div>
                      </div>
                      <div className="font-bold text-lg">
                        {data.price}
                      </div>
                    </div>
                  );
                })}

                {/* Excluded Options */}
                {decision.excluded.length > 0 && (
                   <div className="mt-2 pt-4 border-t border-gray-100">
                     <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Excluded Options</h3>
                     {decision.excluded.map((exc: any) => {
                       const data = providerData[exc.provider.toLowerCase()] || { price: "N/A", eta: "Unavailable", capacity: 0 };
                       return (
                         <div key={exc.provider} className="p-4 flex items-center justify-between opacity-50 bg-[#F9F9F9] rounded-xl mb-2">
                           <div className="flex items-center gap-4">
                             <div className="w-[70px] h-[50px] shrink-0 relative flex items-center justify-center">
                                {getProviderLogo(exc.provider, true)}
                             </div>
                             <div>
                               <div className="font-bold capitalize text-gray-500 line-through text-lg">
                                 {exc.provider}
                               </div>
                               <div className="text-[12px] text-red-500 font-bold mt-1 leading-tight pr-4">
                                 This option is not yet available in your state.
                               </div>
                             </div>
                           </div>
                           <div className="font-bold text-lg text-gray-400">
                             {data.price}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                )}
              </div>
            ) : null}
          </div>
          
          {/* Action Button at bottom of middle col */}
          {!loading && decision && traceVisibleIndex === 4 && !decision.detail && decision.rank?.length > 0 && (
            <div className="mt-6 pt-4 bg-white sticky bottom-0 border-t border-gray-100 flex gap-3 pb-4">
               <button className="flex-[2] py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-lg capitalize shadow-lg">
                 Request {decision.rank[0]}
               </button>
               <button className="flex-1 py-4 bg-white text-black border-2 border-black font-bold rounded-xl hover:bg-gray-50 transition-colors text-[15px] shadow-sm">
                 Other options
               </button>
            </div>
          )}
        </div>

        {/* Right Column (Trace Log replacing Map) */}
        <div className="flex-1 bg-[#F5F7F9] rounded-2xl p-6 overflow-y-auto relative h-[calc(100vh-120px)] border border-gray-200 shadow-inner">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 sticky top-0 bg-[#F5F7F9] pb-4 z-10 border-b border-gray-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-lg shadow-blue-500/50"></span>
            Live Negotiation Trace
          </h2>
          
          {!loading && decision && decision.negotiation_trace ? (
            <div className="flex flex-col h-full">
              {/* Stepper */}
              <div className="relative ml-4 pl-8 border-l-2 border-gray-200 space-y-8 py-4">
                {[
                  { title: "Parsing Constraints", icon: "" },
                  { title: "Consulting Ride APIs", icon: "" },
                  { title: "Consulting Autonomous Fleets", icon: "" },
                  { title: "Resolving Options", icon: "" }
                ].map((step, idx) => {
                   const isActive = idx <= traceVisibleIndex;
                   const isCurrent = idx === traceVisibleIndex;
                   
                   return (
                     <div key={idx} className={`relative transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                       <div className={`absolute -left-[43px] w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-500 ${isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                         {isActive && !isCurrent ? "✓" : (idx + 1)}
                       </div>
                       <h3 className={`font-bold text-[15px] ${isActive ? 'text-black' : 'text-gray-500'}`}>{step.icon} {step.title}</h3>
                       {isCurrent && (
                          <div className="mt-2 text-[13px] text-gray-500 font-mono animate-pulse">
                            Processing...
                          </div>
                       )}
                     </div>
                   );
                })}
              </div>

              {/* Rationale Bottom Box */}
              {traceVisibleIndex === 4 && (
                <div className="mt-4 p-6 bg-black text-white rounded-xl shadow-2xl transition-all duration-1000 opacity-100 transform translate-y-0">
                  <p className="font-bold text-xs mb-3 opacity-60 tracking-widest uppercase">Coordinator Rationale</p>
                  <p className="text-[15px] font-medium leading-relaxed">{decision.rationale}</p>
                </div>
              )}
            </div>
          ) : loading ? (
             <div className="absolute inset-0 flex items-center justify-center opacity-50">
               <svg className="w-12 h-12 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
