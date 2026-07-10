"use client";

import { useState, useRef, useEffect } from "react";

interface SearchResult {
  place_id: number;
  display_name: string;
  name: string;
}

interface AutocompleteInputProps {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
  showCurrentLocation?: boolean;
}

export default function AutocompleteInput({ 
  placeholder, 
  value, 
  onChange, 
  className,
  showCurrentLocation = false
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=us`);
      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setIsOpen(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      searchAddress(val);
    }, 500); // 500ms debounce
  };

  const handleSelect = (address: string) => {
    onChange(address);
    setIsOpen(false);
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      onChange("Fetching location...");
      setIsOpen(false);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          if (data && data.display_name) {
            onChange(data.display_name);
          } else {
            onChange("Current Location");
          }
        } catch {
          onChange("Current Location");
        }
      }, () => {
        onChange("Location access denied");
      });
    } else {
      onChange("Location not supported");
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className={`w-full bg-[#F3F3F3] border-none rounded-lg p-4 text-base outline-none placeholder-gray-500 font-medium focus:ring-2 focus:ring-black transition-shadow ${className || ""}`}
      />
      
      {showCurrentLocation && (
        <button 
          onClick={handleCurrentLocation}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-600 transition-colors z-20"
          title="Use current location"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
          </svg>
        </button>
      )}
      
      {isOpen && value.trim().length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
          
          <div className="overflow-y-auto max-h-[300px]">
            {/* Always show the raw input as the first option */}
            <div
              onClick={() => handleSelect(value)}
              className="px-5 py-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 border-b border-gray-100"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-[15px] truncate">{value}</span>
                <span className="text-[13px] text-gray-500 truncate">Use exact text</span>
              </div>
            </div>

            {isLoading ? (
              <div className="p-5 text-center text-gray-400 text-sm font-medium">Searching...</div>
            ) : results.length > 0 ? (
              results.map((res) => {
                const parts = res.display_name.split(", ");
                const title = res.name || parts[0];
                const subtitle = parts.slice(1).join(", ");
                
                return (
                  <div
                    key={res.place_id}
                    onClick={() => handleSelect(res.display_name)}
                    className="px-5 py-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4 border-b border-gray-50 last:border-b-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-[15px] truncate">{title}</span>
                      <span className="text-[13px] text-gray-500 truncate">{subtitle}</span>
                    </div>
                  </div>
                );
              })
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
