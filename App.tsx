
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TactileCard, GlassOverlay } from './components/TactileCard';
import { SpringButton } from './components/SpringButton';
import { VisionScanner } from './components/VisionScanner';
import { ChatBot } from './components/ChatBot';
import { SupplierMap } from './components/SupplierMap';
import { analyzeCropHealth, findNearbySuppliers, getWeatherImpactAdvice } from './services/geminiService';
import { getNearbyLocalStores } from './services/localStoreService';
import { fetchWeatherForecast } from './services/weatherService';
import { calculateDistance } from './utils/geoUtils';
import { physics } from './theme/motion';
import { DiagnosticResult, StoreLocation, WeatherForecast } from './types';

// Icons
const CameraIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const MapIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>;
const UploadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const VerifiedIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#22C55E"><circle cx="12" cy="12" r="10" fill="#22C55E22" stroke="#22C55E" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="#22C55E" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ShieldIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const ZapIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const PhoneIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

const soilMoistureTrend = [
  { name: '00:00', moisture: 30 }, { name: '04:00', moisture: 35 },
  { name: '08:00', moisture: 32 }, { name: '12:00', moisture: 28 },
  { name: '16:00', moisture: 25 }, { name: '20:00', moisture: 32 },
  { name: '23:59', moisture: 30 },
];

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [suppliers, setSuppliers] = useState<StoreLocation[]>([]);
  const [communityConfirmed, setCommunityConfirmed] = useState<Set<string>>(new Set());
  const [selectedStoreTitle, setSelectedStoreTitle] = useState<string | null>(null);
  const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [weatherAdvice, setWeatherAdvice] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Strict 25km Location Identification with High Accuracy
  useEffect(() => {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });
        try {
          const w = await fetchWeatherForecast(latitude, longitude);
          setWeather(w);
        } catch (e) { console.error(e); }
      },
      (err) => {
        console.warn("Location error:", err.message);
        if (!userPos) setError("Precise location required for strict 25km supplier matching.");
      },
      geoOptions
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Map Selection Sync: Smooth scroll to list item
  useEffect(() => {
    if (selectedStoreTitle) {
      const elementId = `store-${selectedStoreTitle.replace(/\s+/g, '-')}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('store-card-highlight');
        setTimeout(() => element.classList.remove('store-card-highlight'), 2000);
      }
    }
  }, [selectedStoreTitle]);

  const triggerAnalysis = async (imgData: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setSuppliers([]);
    setError(null);
    try {
      const weatherCtx = weather ? `Temp: ${weather.current.temp}°C, Humidity: ${weather.current.humidity}%` : undefined;
      const diagnosis = await analyzeCropHealth(imgData, weatherCtx);
      setResult(diagnosis);
      if (weather && !diagnosis.isOffline) {
        const advice = await getWeatherImpactAdvice(diagnosis.diseaseName, weather);
        setWeatherAdvice(advice);
      }
    } catch (err) {
      setError("Diagnostic unit failure. Secure link and retry.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLocateSuppliers = async () => {
    if (!result || !userPos) return;
    setIsSearchingSuppliers(true);
    const MAX_RADIUS = 25.0; // STRICT LIMIT

    try {
      const treatment = result.recommendations[0] || "agricultural supplies";
      
      // 1. Grounded Retrieval via Gemini Maps Tool
      let res = await findNearbySuppliers(treatment, userPos.lat, userPos.lng);
      
      // 2. Local Fallback Cache / Generative Search
      if (res.length === 0) {
        res = getNearbyLocalStores(userPos.lat, userPos.lng, treatment, MAX_RADIUS);
      }

      // 3. STRICT 25KM SPATIAL FILTER & RANKING
      const strictlyNearby = res
        .map(s => ({
          ...s,
          distance: s.lat && s.lng ? calculateDistance(userPos.lat, userPos.lng, s.lat, s.lng) : 0
        }))
        .filter(s => (s.distance || 0) <= MAX_RADIUS) // Reject far hits
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setSuppliers(strictlyNearby);
      
      if (strictlyNearby.length > 0) {
        setTimeout(() => {
          document.getElementById('regional-resources')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        setError("No verified suppliers detected within the strict 25km safety zone.");
      }
    } catch (e) {
      console.error(e);
      setError("Supply chain grounding failed. Protocol timeout.");
    } finally {
      setIsSearchingSuppliers(false);
    }
  };

  const toggleCommunityReport = (title: string) => {
    const next = new Set(communityConfirmed);
    if (next.has(title)) next.delete(title);
    else next.add(title);
    setCommunityConfirmed(next);
  };

  const criticalWindow = useMemo(() => {
    if (!result || !weather) return null;
    const baseWindow = result.urgency === 'High' ? 24 : 72;
    return weather.current.humidity > 75 ? Math.round(baseWindow * 0.7) : baseWindow;
  }, [result, weather]);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-[1440px] mx-auto transition-all relative selection:bg-[#2D6A4F] selection:text-white">
      <AnimatePresence>{isCameraOpen && <VisionScanner onCapture={(img) => { setImage(img); setIsCameraOpen(false); triggerAnalysis(img); }} onClose={() => setIsCameraOpen(false)} />}</AnimatePresence>
      <ChatBot />
      
      <nav className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2D6A4F] rounded-2xl shadow-soft flex items-center justify-center text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a13 13 0 0 1-10 10Z"></path></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">AgroCare <span className="opacity-40 uppercase">AI</span></h1>
            <div className="flex items-center gap-2 mt-0.5">
               <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2D6A4F]">{isOnline ? 'Active Link' : 'Edge Link Only'}</p>
            </div>
          </div>
        </div>
        <GlassOverlay className="py-2.5 px-6 hidden md:flex items-center gap-3">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest font-mono tracking-tighter">PROTO_UNIT_v3.13</span>
        </GlassOverlay>
      </nav>

      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 text-sm font-bold">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">!</div>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto opacity-40">✕</button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-12">
          {/* Main Scanner Section */}
          <div className="relative group">
            <TactileCard className="relative aspect-square md:aspect-video flex items-center justify-center p-0 overflow-hidden bg-gray-50 border-white/50">
              {image ? (
                <div className="relative w-full h-full">
                  <img src={image} className="w-full h-full object-cover rounded-[30px]" alt="Sample" />
                  <AnimatePresence>
                    {result?.visualEvidence?.map((box, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute border-2 border-red-500 bg-red-500/10 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] pointer-events-none"
                        style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%` }}
                      >
                        <div className="absolute -top-6 left-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Infection Site {i+1}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="w-24 h-24 bg-white rounded-[32px] shadow-tactile border border-white/40 mx-auto mb-8 flex items-center justify-center text-[#2D6A4F]"><CameraIcon /></div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Initiate Diagnostic</h2>
                  <p className="text-xs text-gray-400 mt-2 font-medium">Align leaf for molecular-grade AI inference.</p>
                </div>
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                   <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                   <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Extracting Features...</span>
                </div>
              )}
            </TactileCard>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md flex gap-4 px-8">
              <SpringButton onClick={() => setIsCameraOpen(true)} className="flex-1 shadow-xl" icon={<CameraIcon />}>Scan Field</SpringButton>
              <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const r = new FileReader();
                  r.onload = () => { setImage(r.result as string); triggerAnalysis(r.result as string); };
                  r.readAsDataURL(f);
                }
              }} />
              <SpringButton onClick={() => fileInputRef.current?.click()} variant="secondary" className="flex-1" icon={<UploadIcon />}>Import</SpringButton>
            </div>
          </div>

          {/* Diagnostic Result Panel */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <TactileCard className={`p-10 !bg-white border-2 ${result.urgency === 'High' ? 'border-red-50' : 'border-white'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                        <span className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-[0.3em]">Inference Verified</span>
                      </div>
                      <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{result.diseaseName}</h2>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${result.urgency === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{result.urgency} Urgency</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Severity: <span className="text-gray-900">{result.severity}</span></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4">Pathology Summary</h4>
                      <p className="text-lg text-gray-700 font-medium leading-relaxed">{result.description}</p>
                    </div>
                    {criticalWindow && (
                      <div className="bg-red-50/50 p-6 rounded-[32px] border border-red-100 flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm"><ZapIcon /></div>
                        <div>
                          <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1">Critical window</p>
                          <p className="text-2xl font-black text-red-900 tracking-tight">{criticalWindow} Hours</p>
                          <p className="text-[9px] font-bold text-red-600/60 uppercase tracking-tighter mt-1">Adjusted for Weather Conditions</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-10 pt-10 border-t border-gray-100">
                    <div className="flex-1 space-y-4">
                      <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Treatment Protocol</h4>
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white transition-all">
                          <CheckIcon /> <span className="text-sm font-bold text-gray-800 pt-0.5">{rec}</span>
                        </div>
                      ))}
                    </div>
                    <div className="md:w-72 space-y-6">
                       <GlassOverlay className="p-8 text-center flex flex-col justify-center">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Confidence Index</span>
                          <div className="text-5xl font-black text-[#2D6A4F] mt-2">{(result.confidence * 100).toFixed(0)}%</div>
                          <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence * 100}%` }} className="h-full bg-[#2D6A4F]" />
                          </div>
                       </GlassOverlay>
                       <SpringButton onClick={handleLocateSuppliers} className="w-full h-20" variant="secondary" icon={<MapIcon />}>{isSearchingSuppliers ? 'Scanning Proximity...' : 'Locate Resources'}</SpringButton>
                    </div>
                  </div>
                </TactileCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Regional Resources (Map & List) */}
          <AnimatePresence>
            {suppliers.length > 0 && (
              <motion.div id="regional-resources" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#2D6A4F] tracking-[0.4em] mb-2 block">Precise Location Link: Enabled</span>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Regional Resources</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">STRICT 25KM LOCK</span>
                  </div>
                </div>

                <div className="h-[450px]">
                  <SupplierMap 
                    suppliers={suppliers} 
                    userLocation={userPos} 
                    selectedStoreTitle={selectedStoreTitle}
                    onStoreSelect={setSelectedStoreTitle}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {suppliers.map((store) => (
                    <motion.div
                      key={store.title}
                      id={`store-${store.title.replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedStoreTitle(store.title)}
                      className={`store-card-item cursor-pointer material-matte p-6 rounded-[28px] border transition-all ${selectedStoreTitle === store.title ? 'border-[#2D6A4F] shadow-soft' : 'border-white/40 shadow-tactile'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                           <h4 className="font-black text-gray-900 leading-tight">{store.title}</h4>
                           {store.isVerified && <VerifiedIcon />}
                        </div>
                        <span className={`text-[10px] font-black font-mono tracking-tighter px-2 py-0.5 rounded ${ (store.distance || 0) <= 25 ? 'text-[#2D6A4F] bg-green-50' : 'text-red-500 bg-red-50'}`}>
                          {(store.distance || 0).toFixed(1)}KM
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {store.inventory?.map((item, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-tighter">{item}</span>
                        ))}
                      </div>

                      <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                        <div className="flex gap-3">
                          <a href={`tel:${store.phone || '#'}`} className="flex-1 bg-gray-50 hover:bg-white border border-gray-100 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2D6A4F] transition-all">
                            <PhoneIcon /> Call Store
                          </a>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleCommunityReport(store.title); }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${communityConfirmed.has(store.title) ? 'bg-green-500 text-white border-green-600 shadow-soft' : 'bg-white text-gray-400 border-gray-100 hover:border-green-500 hover:text-green-500'}`}
                          >
                            {communityConfirmed.has(store.title) ? '✓ Reported Stock' : 'Report Stock'}
                          </button>
                        </div>
                        <a href={store.uri} target="_blank" rel="noopener noreferrer" className="w-full bg-[#2D6A4F] py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white shadow-soft transition-all">
                          Navigate (Maps)
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Telemetry Column */}
        <div className="lg:col-span-5 space-y-10">
          <TactileCard title="Environmental Unit" className="!p-8">
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="p-10 rounded-[40px] bg-gray-50/50 border border-white flex flex-col items-center justify-center shadow-inner relative overflow-hidden group">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Air Temp</span>
                <span className="text-5xl font-black text-gray-900 tracking-tighter font-mono">{weather?.current.temp ?? '--'}<span className="text-xl text-gray-300 ml-1">°C</span></span>
              </div>
              <div className="p-10 rounded-[40px] bg-gray-50/50 border border-white flex flex-col items-center justify-center shadow-inner group">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Humidity</span>
                <span className="text-5xl font-black text-gray-900 tracking-tighter font-mono">{weather?.current.humidity ?? '--'}<span className="text-xl text-gray-300 ml-1">%</span></span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2D6A4F]">Saturation Dynamics</span>
              </div>
              <div className="h-44 w-full material-matte rounded-[32px] p-6 shadow-inner border border-gray-100/50">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={soilMoistureTrend}>
                      <defs><linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3}/><stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                      <XAxis dataKey="name" hide /><YAxis hide /><Area type="monotone" dataKey="moisture" stroke="#2D6A4F" strokeWidth={4} fill="url(#colorM)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
            </div>
          </TactileCard>

          <TactileCard title="System Telemetry" className="!p-8">
            <div className="space-y-8">
              <div className="flex gap-5">
                 <div className={`w-3 h-3 rounded-full mt-1.5 shadow-[0_0_12px_rgba(59,130,246,0.5)] ${isOnline ? 'bg-blue-500' : 'bg-orange-500'}`} />
                 <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 font-mono">LINK_READY</span>
                    <p className="text-sm font-bold text-gray-800 leading-tight mt-1">
                       {isOnline ? 'Cloud Neural Sync: Active' : 'Edge Mode: Limited Local Inference'}
                    </p>
                 </div>
              </div>
              {weatherAdvice && (
                <div className="flex gap-5">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                   <div>
                      <span className="text-[10px] font-black uppercase text-[#2D6A4F] font-mono">WEATHER_ADVISORY</span>
                      <p className="text-sm font-bold text-gray-800 leading-tight mt-1">{weatherAdvice}</p>
                   </div>
                </div>
              )}
            </div>
          </TactileCard>
        </div>
      </div>
      
      <footer className="mt-32 pt-16 pb-24 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-4">
          <ShieldIcon />
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em]">Protocol AgroCare Pro v3.1</span>
        </div>
        <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
           <a href="#" className="hover:text-[#2D6A4F] transition-all">Field Docs</a>
           <a href="#" className="hover:text-[#2D6A4F] transition-all">Sensor API</a>
           <a href="#" className="hover:text-[#2D6A4F] transition-all">Ethics Shield</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
