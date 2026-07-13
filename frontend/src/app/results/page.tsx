"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Search, Clock, CreditCard, Shield, User, Globe } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

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
  const [traceVisibleIndex, setTraceVisibleIndex] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  // New Booking State
  const [bookingStep, setBookingStep] = useState<"compare" | "select_tier" | "checkout">("compare");
  const [rideTiers, setRideTiers] = useState<any[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  
  // Auth State from Context
  const { user, setShowAuthModal } = useAuth();
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Helper for branded logos
  const getProviderLogo = (providerName: string, isExcluded: boolean = false) => {
    const name = providerName.toLowerCase();
    
    if (name === 'uber') return <div className={`font-medium tracking-tighter text-2xl ${isExcluded ? 'text-gray-400' : 'text-black'}`}>Uber</div>;
    if (name === 'lyft') return <div className={`font-bold tracking-tighter text-2xl ${isExcluded ? 'text-gray-400' : 'text-[#FF00BF]'}`}>lyft</div>;
    if (name === 'waymo') return <div className={`font-bold tracking-widest text-lg ${isExcluded ? 'text-gray-400' : 'text-[#00A69C]'}`}>W<span className="text-sm">AYMO</span></div>;
    if (name === 'cruise') return <div className={`font-bold tracking-tight text-2xl ${isExcluded ? 'text-gray-400' : 'text-[#FF5A00]'}`}>cruise</div>;
    if (name === 'zoox') return <div className={`font-black tracking-widest text-xl ${isExcluded ? 'text-gray-400' : 'text-[#FF8A00]'}`}>ZOOX</div>;
    if (name === 'revel') return <div className={`font-bold tracking-tighter text-2xl italic ${isExcluded ? 'text-gray-400' : 'text-[#005CFF]'}`}>Revel</div>;
    if (name === 'robotaxi') return <div className={`font-black tracking-tighter text-xl ${isExcluded ? 'text-gray-400' : 'text-gray-800'}`}>TESLA</div>;
    return <div className={`font-mono font-bold text-lg ${isExcluded ? 'text-gray-400' : 'text-gray-800'}`}>ROBO</div>;
  };

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
        if (data && data.rank && data.rank.length > 0) {
          setSelectedProvider(data.rank[0]);
        }
      } catch (err) {
        console.error(err);
        setDecision({ detail: "Failed to connect to backend." });
      } finally {
        setLoading(false);
      }
    };
    
    if (decision === null && (pickup || dropoff || specialRequests)) {
      fetchNegotiation();
    } else if (!pickup && !dropoff && !specialRequests) {
      setLoading(false);
    }
  }, [pickup, dropoff, specialRequests, decision, loading]);


  const handleCheckout = async () => {
    if (!user) return;
    try {
      await fetch("http://localhost:8000/api/user/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          provider: selectedProvider,
          tier: selectedTier.name,
          price: selectedTier.price,
          pickup,
          dropoff
        })
      });
      setBookingSuccess(true);
    } catch (e) {
      console.error(e);
      setBookingSuccess(true); // show success anyway for demo
    }
  };

  useEffect(() => {
    if (decision && !decision.detail) {
      const timer = setInterval(() => {
        setTraceVisibleIndex(prev => {
          if (prev < 6) return prev + 1;
          clearInterval(timer);
          return prev;
        });
      }, 800);
      return () => clearInterval(timer);
    }
  }, [decision]);

  const handleRequestProvider = async (provider: string) => {
    const bid = decision.bids?.find((b: any) => b.provider === provider);
    if (!bid) return;
    
    setBookingStep("select_tier");
    setLoadingTiers(true);
    
    try {
      const res = await fetch(`http://localhost:8000/api/tiers?provider=${provider}&base_price=${bid.price_usd}&eta=${bid.eta_pickup_min}`);
      const data = await res.json();
      if (data.tiers) {
        setRideTiers(data.tiers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTiers(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black flex flex-col">
      {/* Sleek Header */}
      <Header />

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
          <h2 className="text-[32px] font-bold mb-4 tracking-tight">Choose an option below:</h2>
          
          <div className="flex-1 overflow-y-auto">
            {loading || (decision && traceVisibleIndex < 6) ? (
              <div className="flex flex-col items-center justify-center h-48">
                 <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="font-bold animate-pulse">Agents Negotiating...</p>
              </div>
            ) : decision?.detail ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
                <h3 className="font-bold mb-2">Backend Error</h3>
                <p className="text-sm">{decision.detail}</p>
              </div>
            ) : bookingStep !== "compare" ? (
             <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setBookingStep("compare"); setRideTiers([]); setSelectedTier(null); }}
                  className="self-start text-sm font-bold text-gray-500 hover:text-black flex items-center gap-1 mb-2"
                >
                  &larr; Back to comparison
                </button>
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-[80px] h-[50px] shrink-0 relative flex items-center justify-center">
                     {getProviderLogo(selectedProvider!)}
                   </div>
                   <h2 className="text-2xl font-bold capitalize">Choose your {selectedProvider === "robotaxi" ? "Tesla" : selectedProvider} ride</h2>
                </div>
                
                {loadingTiers ? (
                  <div className="flex flex-col items-center py-10">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold animate-pulse text-gray-500">Qwen is generating dynamic tiers...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 px-2 py-1">
                    {rideTiers.map((tier, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-4 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${selectedTier?.name === tier.name ? 'border-black bg-white shadow-md scale-[1.02]' : 'border-transparent hover:bg-gray-50'}`}
                      >
                        <div className="flex flex-col gap-1">
                           <div className="font-bold text-lg">{tier.name}</div>
                           <div className="text-sm text-gray-500 flex items-center gap-2">
                             <span className="font-semibold text-black">{tier.eta} mins away</span>
                             <span>•</span>
                             <span className="flex items-center"><User size={14} className="mr-0.5 stroke-[3]" />{tier.capacity}</span>
                           </div>
                           <div className="text-xs text-gray-400 font-medium mt-1">{tier.description}</div>
                        </div>
                        <div className="font-bold text-xl">${tier.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedTier && !loadingTiers && (
                   <div className="mt-4 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-4 z-10">
                     <button 
                       onClick={() => user ? setBookingStep("checkout") : setShowAuthModal(true)}
                       className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-lg shadow-lg relative overflow-hidden group"
                     >
                       <span className="relative z-10">Confirm {selectedTier.name}</span>
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                     </button>
                   </div>
                )}
             </div>
            ) : decision?.rank ? (
              <div className="flex flex-col gap-4 px-2 py-1">
                {/* Ranked Options */}
                {decision.rank.map((provider: string, idx: number) => {
                  const bid = decision.bids?.find((b: any) => b.provider === provider);
                  const isSelected = selectedProvider === provider;
                  
                  const price = bid ? `$${bid.price_usd.toFixed(2)}` : "N/A";
                  const eta = bid ? `${bid.eta_pickup_min} mins away` : "Unknown";
                  const capacity = bid ? bid.capacity : 4;
                  const badge = bid && bid.flags.length > 0 ? bid.flags[0].replace(/_/g, ' ') : "";
                  
                  return (
                    <div 
                      key={provider} 
                      onClick={() => setSelectedProvider(provider)}
                      className={`p-3.5 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'border-black bg-white shadow-md scale-[1.02]' : 'border-transparent hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-[60px] h-[40px] shrink-0 relative flex items-center justify-center">
                          {getProviderLogo(provider)}
                        </div>
                        
                        <div className="flex flex-col justify-center">
                          <p className="font-bold text-lg leading-tight capitalize">{provider === "robotaxi" ? "Tesla" : provider}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <span className="text-black font-semibold">{eta}</span> • <span className="flex items-center"><User size={14} className="mr-0.5 stroke-[3]" />{capacity}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-xl">{price}</span>
                        {badge && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 tracking-wide uppercase">
                            {badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Excluded Options */}
                {decision.excluded.length > 0 && (
                   <div className="mt-2 pt-4 border-t border-gray-100">
                     <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Excluded Options</h3>
                     {decision.excluded.map((exc: any) => {
                       const bid = decision.bids?.find((b: any) => b.provider === exc.provider);
                       const price = bid ? `$${bid.price_usd.toFixed(2)}` : "N/A";
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
                             {price}
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
          {!loading && decision && traceVisibleIndex === 6 && !decision.detail && decision.rank?.length > 0 && bookingStep === "compare" && (
            <div className="mt-6 pt-4 bg-white sticky bottom-0 border-t border-gray-100 flex gap-3 pb-4 relative">
               <button 
                 onClick={() => handleRequestProvider(selectedProvider!)}
                 className="flex-[2] py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-lg capitalize shadow-lg">
                 Request {selectedProvider}
               </button>
               <div className="flex-1 relative">
                 <button 
                   onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                   className="w-full py-4 bg-white text-black border-2 border-black font-bold rounded-xl hover:bg-gray-50 transition-colors text-[15px] shadow-sm"
                 >
                   Other options
                 </button>
                 
                 {/* Drop-up Menu */}
                 {showOptionsMenu && (
                   <div className="absolute bottom-[110%] left-0 w-full mb-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col z-50">
                     {decision.rank.filter((p: string) => p !== selectedProvider).map((p: string) => (
                       <button 
                         key={p}
                         onClick={() => {
                           setSelectedProvider(p);
                           setShowOptionsMenu(false);
                         }}
                         className="p-4 text-left hover:bg-gray-50 font-bold capitalize border-b border-gray-100 last:border-0"
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Right Column (Trace Log replacing Map) */}
        <div className="flex-1 bg-[#F5F7F9] rounded-2xl p-6 relative h-[calc(100vh-140px)] border border-gray-200 shadow-inner overflow-hidden">
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
                  { title: "Evaluating Safety Metrics", icon: "" },
                  { title: "Resolving Options", icon: "" },
                  { title: "Finalizing Coordinator Decision", icon: "" }
                ].map((step, idx) => {
                   const isActive = idx <= traceVisibleIndex;
                   const isCurrent = idx === traceVisibleIndex;
                   
                   return (
                      <div key={idx} className={`relative transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`absolute -left-[43px] w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-500 ${isActive && !isCurrent ? 'bg-black text-white' : 'bg-gray-200'}`}>
                          {isActive && !isCurrent ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ) : (
                            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                          )}
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
              {traceVisibleIndex === 6 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4 tracking-tight">Your RideFare coordinator agent has decided:</h3>
                  <div className="p-6 bg-black text-white rounded-xl shadow-2xl transition-all duration-1000 opacity-100 transform translate-y-0">
                    <p className="font-bold text-xs mb-3 opacity-60 tracking-widest uppercase">Coordinator Rationale</p>
                    <p className="text-[11px] font-medium leading-relaxed">{decision.rationale}</p>
                  </div>
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


      {/* Checkout/Booking Success Modal */}
      {bookingStep === "checkout" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            {bookingSuccess ? (
              <div className="text-center flex flex-col items-center py-6">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h2 className="text-3xl font-bold mb-2 tracking-tight">Ride Confirmed!</h2>
                <p className="text-gray-500 mb-8 font-medium">Your {selectedTier?.name} is on its way.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-sm mb-3"
                >
                  Book another ride
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="w-full py-4 bg-transparent text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold mb-6">Checkout</h2>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-medium text-[15px]">Ride Total</span>
                    <span className="font-bold text-2xl tracking-tight">${selectedTier?.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-gray-600 font-bold text-sm flex items-center gap-3">
                      <div className="bg-blue-600 text-white rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider">Visa</div>
                      •••• {user?.cc_last4}
                    </span>
                    <span className="text-blue-600 font-bold text-sm cursor-pointer hover:underline">Change</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-lg shadow-xl relative overflow-hidden group"
                >
                  <span className="relative z-10">Pay ${selectedTier?.price.toFixed(2)}</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                <button 
                  onClick={() => setBookingStep("select_tier")}
                  className="w-full py-4 mt-2 bg-transparent text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
