import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Download, 
  Maximize2, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Target,
  Check,
  Loader2,
  X,
  ChevronLeft,
  Sparkles,
  Search
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { reviewPreviewImages as centralizedPreviewImages, reviewAnglesList as centralizedAnglesList, images } from '../../data';
import MetadataFieldCard, { getColorHex } from '../ui/MetadataFieldCard';
// import { extractedData } from '../generator/TechPackIngestionModal';

import { useStudioStore } from '@/src/store/useStudioStore';

const descriptionList: Record<string, string> = {
  'FRONT ELEVATION': 'Primary Orthographic Profile',
  'THREE-QUARTER RIGHT': 'Right Perspective View',
  'THREE-QUARTER LEFT': 'Left Perspective View',
  'LEFT PROFILE': 'Left Orthogonal Profile',
  'RIGHT PROFILE': 'Right Orthogonal Profile',
  'REAR PROFILE': 'Rear Orthogonal Profile',
  'UNDER VIEW': 'Under-Visor and Stitching View'
};

const accuracyList: Record<string, string> = {
  'FRONT ELEVATION': '99.8% Accuracy',
  'THREE-QUARTER RIGHT': '99.2% Accuracy',
  'THREE-QUARTER LEFT': '98.9% Accuracy',
  'LEFT PROFILE': '99.1% Accuracy',
  'RIGHT PROFILE': '99.4% Accuracy',
  'REAR PROFILE': '98.5% Accuracy',
  'UNDER VIEW': '97.8% Accuracy'
};

interface IngestionReviewProps {
  onBack: () => void;
  onApprove: () => void;
  onSaveAsDraft?: () => void;
}

export default function IngestionReview({ onBack, onApprove, onSaveAsDraft }: IngestionReviewProps) {
  const [activeRightTab, setActiveRightTab] = useState<'Refinements' | 'Metadata' | 'Branding' | 'TechPack'>('Metadata');
  const [isAnglesOpen, setIsAnglesOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [selectedAngles, setSelectedAngles] = useState<string[]>(['All']);
  const [renderedIndex, setRenderedIndex] = useState(-1);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [refinePromptIndex, setRefinePromptIndex] = useState<number | null>(null);
  const [refiningStates, setRefiningStates] = useState<Record<number, boolean>>({});
  const [isAnalyzingLibrary, setIsAnalyzingLibrary] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [selectedAnglesToRender, setSelectedAnglesToRender] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('selectedRenderAngles');
      return stored ? JSON.parse(stored) : centralizedAnglesList;
    } catch {
      return centralizedAnglesList;
    }
  });

  const anglesList = centralizedAnglesList.filter(angle => selectedAnglesToRender.includes(angle));
  const previewImages = centralizedPreviewImages.filter(item => selectedAnglesToRender.includes(item.label));

  const [refineInputValue, setRefineInputValue] = useState('');
  const [refinementHistory, setRefinementHistory] = useState([
    {
      angle: 'FRONT ELEVATION',
      change: 'Increase logo saturation by 15%',
      timestamp: '2 mins ago',
      id: 'r1',
      isUndone: false
    },
    {
      angle: 'THREE-QUARTER RIGHT',
      change: 'Reduce fabric grain visibility',
      timestamp: '8 mins ago',
      id: 'r2',
      isUndone: false
    },
    {
      angle: 'REAR PROFILE',
      change: 'Adjust rim light intensity',
      timestamp: '15 mins ago',
      id: 'r3',
      isUndone: false
    },
    {
      angle: 'UNDER VIEW',
      change: 'Sharpen embroidery edges',
      timestamp: '24 mins ago',
      id: 'r4',
      isUndone: false
    }
  ]);

  const angleToIndex: Record<string, number> = {
    'FRONT ELEVATION': 0,
    'THREE-QUARTER RIGHT': 1,
    'THREE-QUARTER LEFT': 2,
    'LEFT PROFILE': 3,
    'RIGHT PROFILE': 4,
    'REAR PROFILE': 5,
    'UNDER VIEW': 6
  };

  const reRender = (idx: number) => {
    setRefiningStates(prev => ({...prev, [idx]: true}));
    setTimeout(() => {
      setRefiningStates(prev => ({...prev, [idx]: false}));
    }, 2500);
  };

  const handleRefineSubmit = (idx: number) => {
    if (refineInputValue.trim()) {
      const angle = anglesList[idx];
      const newRefinement = {
        angle,
        change: refineInputValue,
        timestamp: 'Just now',
        id: `r-${Date.now()}`,
        isUndone: false
      };
      setRefinementHistory(prev => [newRefinement, ...prev]);
      setRefineInputValue('');
    }
    setRefinePromptIndex(null);
    reRender(idx);
  };

  const handleUndo = (id: string, angle: string) => {
    setRefinementHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isUndone: true } : item
    ));
    const idx = angleToIndex[angle];
    if (idx !== undefined) reRender(idx);
  };

  const extractedData = useStudioStore(
    (state) => state.extractedData
  );  

  const activeTimers = useRef<NodeJS.Timeout[]>([]);

  const triggerAnimation = () => {
    // Clear existing timers
    activeTimers.current.forEach(clearTimeout);
    activeTimers.current = [];

    if (selectedAngles.includes('All')) {
      setRenderedIndex(-1);
      previewImages.forEach((_, idx) => {
        activeTimers.current.push(setTimeout(() => setRenderedIndex(idx), 800 + idx * 600));
      });
    } else {
      // Re-render only selected angles
      selectedAngles.forEach(angle => {
        const idx = angleToIndex[angle];
        if (idx !== undefined) {
          reRender(idx);
        }
      });
    }

    return () => {
      activeTimers.current.forEach(clearTimeout);
      activeTimers.current = [];
    };
  };

  useEffect(() => {
    triggerAnimation();
    return () => {
      activeTimers.current.forEach(clearTimeout);
      activeTimers.current = [];
    };
  }, []);

  const toggleAngle = (angle: string) => {
    if (angle === 'All') {
      setSelectedAngles(['All']);
      return;
    }
    
    let newSelected = selectedAngles.filter(a => a !== 'All');
    
    if (newSelected.includes(angle)) {
      newSelected = newSelected.filter(a => a !== angle);
      if (newSelected.length === 0) newSelected = ['All'];
    } else {
      newSelected.push(angle);
    }
    setSelectedAngles(newSelected);
  };

  // const metadata = [
  //   { label: 'STYLE CODE', value: '59FIFTY', confidence: 100 },
  //   { label: 'FABRIC', value: 'Polyester', confidence: 100 },
  //   { label: 'UNDERCOLOR', value: 'Grey', confidence: 100, isColor: true, color: '#808080' },
  //   { label: 'SWEATBAND', value: 'Black', confidence: 100, isColor: true, color: '#000000' },
  //   { label: 'FRONT LOGO TREATMENT', value: 'Raised Embroidery', confidence: 100 },
  //   { label: 'FRONT LOGO PLACEMENT', value: 'Centered Front Panels', confidence: 100 },
  //   { label: 'PMS COLORS', value: '200C, 282C, White', confidence: 100 },
  //   { label: 'REAR LOGO PLACEMENT', value: 'Centered Rear Panels', confidence: 100 },
  // ];

  const title = `${extractedData?.teamName || ''} ${extractedData?.silhouetteFamily || ''} ${extractedData?.silhouetteStyle || ''}`.trim();  

  const frontLogo = extractedData?.structuredLogos?.find(
    (logo) => logo.position === 'front'
  );
  
  const rearLogo = extractedData?.structuredLogos?.find(
    (logo) => logo.position === 'rear'
  );
  
  const pmsColors = [
    ...new Set(
      extractedData?.structuredLogos?.flatMap((logo) =>
        logo.colorLayers?.map((c) => c.pms)
      ) || []
    )
  ].join(', ');

  const metadata = [
    { label: 'TEAM NAME', value: `${extractedData?.teamName || ''}`, confidence: 100 },
    {label: 'STYLE CODE', value: `${extractedData?.silhouetteFamily || ''} ${extractedData?.silhouetteStyle || ''}`.trim(), confidence: 100 },
    // { label: 'STYLE', value: 'Fitted', confidence: 100 },
    // { label: 'FABRIC', value: 'Polyester', confidence: 100 },
    // { label: 'CROWN COLOR', value: 'Black', confidence: 100, isColor: true },
    // { label: 'VISOR COLOR', value: 'Teal', confidence: 100, isColor: true },
    { label: 'UNDERCOLOR', value: extractedData?.undervisorColor || '-', confidence: 100, isColor: true },
    // { label: 'BUTTON COLOR', value: 'Teal', confidence: 100, isColor: true },
    // { label: 'VISOR STITCHING', value: 'Black', confidence: 100, isColor: true },
    // { label: 'EYELETS', value: 'Black', confidence: 100, isColor: true },

    { label: 'SWEATBAND', value: extractedData?.sweatbandColor || '-', confidence: 100, isColor: true },
    { label: 'NEC FLAG', value: extractedData?.newEraFlagColor || '-', confidence: 100, isColor: true },    
    {label: 'FABRIC', value: extractedData?.fabricTech || '-', confidence: 100 },        
    { label: 'FRONT LOGO TREATMENT', value: frontLogo?.isRaised? 'Raised Embroidery' : 'Direct Embroidery', confidence: 100 },
    { label: 'FRONT LOGO PLACEMENT', value: frontLogo?.position || '-', confidence: 100 },
    { label: 'PMS COLORS', value: pmsColors || '-', confidence: 100 },
    { label: 'REAR LOGO PLACEMENT', value: rearLogo?.position || '-', confidence: 100 },
  ];

  const secondaryAngles = [
    { label: 'THREE-QUARTER RIGHT', img: images.capSide, idx: 1 },
    { label: 'THREE-QUARTER LEFT', img: images.capRear, idx: 2 },
    { label: 'LEFT PROFILE', img: images.capTop, idx: 3 },
    { label: 'RIGHT PROFILE', img: images.capIso, idx: 4 },
    { label: 'REAR PROFILE', img: images.underVisorDetail, idx: 5 },
    { label: 'UNDER VIEW', img: images.sweatbandDetail, idx: 6 }
  ];

  const getRefineAngleData = (idx: number) => {
    if (idx === 0) {
      return {
        label: 'FRONT ELEVATION',
        img: images.capFront
      };
    }
    const secondary = secondaryAngles.find(a => a.idx === idx);
    if (secondary) {
      return {
        label: secondary.label,
        img: secondary.img
      };
    }
    return {
      label: centralizedAnglesList[idx] || 'Unknown Angle',
      img: images.capFront
    };
  };

  return (
    <div className="h-screen bg-bg-primary pl-16 peer-hover:pl-48 pt-[76px] flex flex-col overflow-hidden transition-all duration-300">
      {/* Top Navigation Bar */}
      <div className="pt-7 pb-5 border-b border-slate-100 dark:border-white/5 bg-bg-secondary flex items-center justify-between px-8 z-20 shrink-0 transition-all duration-300">
        <div className="flex flex-col">
          {/* Breadcrumb Trail Stacked Vertically Above Heading */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 select-none">
            <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors" onClick={onBack}>Studio</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-text-primary">Ingestion Review</span>
          </div>

          {/* Heading and description */}
          <h1 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">Ingestion Review</h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1.5">Review and refine AI-generated photo-realistic product angles from tech pack ingestion.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
            className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-white/10 bg-bg-secondary hover:bg-slate-50 dark:hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-[12px] font-bold uppercase tracking-wider transition-premium cursor-pointer active-scale shadow-sm"
          >
            <Download size={14} className="shrink-0 text-text-tertiary" />
            <span>Download</span>
            <ChevronDown size={13} className={`shrink-0 text-text-tertiary transition-transform duration-300 ${isDownloadOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDownloadOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDownloadOpen(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 min-w-[200px] premium-dropdown z-50 origin-top-right overflow-hidden"
                >
                  <div className="px-3 py-1.5 border-b border-border-primary mb-1">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Download Asset</span>
                  </div>
                  <div 
                    className="premium-dropdown-item justify-between"
                    onClick={() => {
                      setIsDownloadOpen(false);
                    }}
                  >
                    <span className="tracking-tight">ALL_ASSETS (.ZIP)</span>
                    <Download size={12} className="text-text-tertiary group-hover:text-text-primary transition-premium" />
                  </div>
                  <div className="h-px bg-border-primary my-1 mx-2" />
                  <div className="max-h-[240px] overflow-y-auto scrollbar-none">
                    {anglesList.map(angle => (
                      <div 
                        key={angle}
                        className="premium-dropdown-item justify-between"
                        onClick={() => {
                          setIsDownloadOpen(false);
                        }}
                      >
                        <span className="font-medium tracking-tight">{angle}</span>
                        <Download size={12} className="text-text-tertiary group-hover:text-text-primary transition-premium" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Preview Area (Left 2/3) */}
        <div className="flex-[2] overflow-y-auto py-8 px-8 flex flex-col items-center custom-scrollbar bg-slate-100 dark:bg-slate-900/40 transition-all duration-300">
          <div className="w-full max-w-5xl">

            <div className="grid grid-cols-12 gap-4 items-stretch">
              {/* Primary View */}
              <div className="col-span-5">
                <div className="relative h-full rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden group">
                  {!selectedAnglesToRender.includes('FRONT ELEVATION') && (
                    <div className="absolute inset-0 bg-slate-50 dark:bg-[#0D1117] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl z-20">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 mb-3">
                        <Target size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-widest block">FRONT ELEVATION</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 mb-4 leading-normal px-2">Angle excluded from the generation batch</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnglesToRender(prev => {
                            const next = [...prev, 'FRONT ELEVATION'];
                            localStorage.setItem('selectedRenderAngles', JSON.stringify(next));
                            return next;
                          });
                          reRender(0);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest cursor-pointer active:scale-95 transition-premium shadow-md border dark:border-white/10"
                      >
                        <Sparkles size={11} /> Generate View
                      </button>
                    </div>
                  )}
                  {(renderedIndex < 0 || refiningStates[0]) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-black/80 z-20 transition-all">
                      <Loader2 className="animate-spin text-slate-400 dark:text-slate-600 mb-3" size={28} />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse mt-2">{refiningStates[0] ? 'Refining...' : 'Rendering'}</span>
                    </div>
                  ) : (
                    <img src={images.capFront} className="h-full w-full object-contain animate-in fade-in duration-700 dark:opacity-90" />
                  )}

                  {renderedIndex >= 0 && !refiningStates[0] && (
                    <div className="absolute inset-0 bg-slate-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                      <div className="flex flex-col gap-2 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
                        <button onClick={(e) => { e.stopPropagation(); setPreviewIndex(0); }} className="bg-white dark:bg-black text-slate-900 dark:text-white px-6 py-2 rounded shadow-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 border dark:border-white/10">
                          <Maximize2 size={12} /> Expand
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setRefinePromptIndex(0); }} className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded shadow-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95">
                          <Sparkles size={12} /> Refine
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-white/10 z-0 transition-all">
                    Front Elevation
                  </div>
                </div>
              </div>

              {/* Secondary Angles Grid (Perfect 3x2 symmetrical layout) */}
              <div className="col-span-7 grid grid-cols-3 gap-3">
                {secondaryAngles.map((angle, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden group transition-all">
                    {!selectedAnglesToRender.includes(angle.label) && (
                      <div className="absolute inset-0 bg-slate-50 dark:bg-[#0D1117] flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl z-20">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 mb-2">
                          <Target size={14} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 dark:text-white uppercase tracking-widest block truncate max-w-full px-1">{angle.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnglesToRender(prev => {
                              const next = [...prev, angle.label];
                              localStorage.setItem('selectedRenderAngles', JSON.stringify(next));
                              return next;
                            });
                            reRender(angle.idx);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-[8px] font-bold uppercase tracking-widest cursor-pointer active:scale-95 transition-premium mt-3 border dark:border-white/10"
                        >
                          <Sparkles size={9} /> Generate View
                        </button>
                      </div>
                    )}
                    {(renderedIndex < angle.idx || refiningStates[angle.idx]) ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-black/80 z-20 transition-all">
                        <Loader2 className="animate-spin text-slate-300 dark:text-slate-700 mb-2" size={20} />
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse mt-1">{refiningStates[angle.idx] ? 'Refining...' : 'Rendering'}</span>
                      </div>
                    ) : (
                      <img src={angle.img} className="h-full w-full object-cover animate-in fade-in duration-700 delay-100 fill-mode-both dark:opacity-90" />
                    )}

                    {renderedIndex >= angle.idx && !refiningStates[angle.idx] && (
                      <div className="absolute inset-0 bg-slate-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                        <div className="flex flex-col gap-1.5 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
                          <button onClick={(e) => { e.stopPropagation(); setPreviewIndex(angle.idx); }} className="bg-white dark:bg-black text-slate-900 dark:text-white px-4 py-1.5 rounded shadow-lg text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-transform hover:scale-105 active:scale-95 border dark:border-white/10">
                            <Maximize2 size={10} /> Expand
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setRefinePromptIndex(angle.idx); }} className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-1.5 rounded shadow-lg text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-transform hover:scale-105 active:scale-95">
                            <Sparkles size={10} /> Refine
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-0.5 rounded text-[7px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-white/10 z-0 transition-all">
                      {angle.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Controls */}
            <div className="mt-8 flex justify-center relative">
              <div className="flex items-center p-1 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/10 dark:shadow-none z-30 transition-all duration-300">
                <div className="flex items-center px-4 py-2 border-r border-slate-100 dark:border-white/5 h-10">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-4">Angles</span>
                  <div className="relative">
                    <button 
                      onClick={() => setIsAnglesOpen(!isAnglesOpen)}
                      className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-white/10"
                    >
                      <span className="text-[12px] font-bold text-slate-900 dark:text-white min-w-[30px] text-left">
                        {selectedAngles.includes('All') ? 'All' : (selectedAngles.length === 1 ? selectedAngles[0] : `${selectedAngles.length} Selected`)}
                      </span>
                      <ChevronDown size={14} className={`text-slate-400 dark:text-slate-600 transition-transform duration-300 ${isAnglesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isAnglesOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsAnglesOpen(false)} 
                          />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-3 left-0 min-w-[200px] bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none p-2 z-50 origin-bottom-left"
                          >
                            <div className="max-h-[240px] overflow-y-auto scrollbar-hide">
                              {anglesList.map(angle => (
                                <div 
                                  key={angle}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group transition-all"
                                  onClick={() => toggleAngle(angle)}
                                >
                                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${selectedAngles.includes(angle) ? 'bg-black dark:bg-white border-black dark:border-white' : 'border-slate-300 dark:border-white/20 group-hover:border-slate-400 dark:group-hover:border-white/40'}`}>
                                    {selectedAngles.includes(angle) && <Check size={10} className="text-white dark:text-black" strokeWidth={3} />}
                                  </div>
                                  <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white tracking-tight">{angle}</span>
                                </div>
                              ))}
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-white/5 my-1 mx-2" />
                            <div 
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer group transition-all"
                              onClick={() => toggleAngle('All')}
                            >
                              <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${selectedAngles.includes('All') ? 'bg-black dark:bg-white border-black dark:border-white scale-100' : 'border-slate-300 dark:border-white/20 scale-100 group-hover:border-slate-400 dark:group-hover:border-white/40'}`}>
                                {selectedAngles.includes('All') && <Check size={10} className="text-white dark:text-black" strokeWidth={3} />}
                              </div>
                              <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white tracking-tight">All</span>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button 
                  onClick={triggerAnimation}
                  className="flex items-center gap-2.5 px-5 py-2 h-10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all group transition-all duration-300"
                >
                  <RotateCcw size={14} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-transform group-hover:rotate-[-45deg]" />
                  <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Recalibrate</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Panel (Right 30%) */}
        <div className="w-[30%] border-l border-slate-100 dark:border-white/5 bg-bg-secondary flex flex-col overflow-hidden transition-all duration-300">
          <div className="py-4 px-8 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-[14px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Tech Pack Metadata</h3>
            <h2 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">Arizona Diamondbacks 59FIFTY THE ORIGINAL</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-slate-100 dark:border-white/5 px-8 bg-slate-50/50 dark:bg-white/5 transition-all duration-300">
            <button 
              onClick={() => setActiveRightTab('Metadata')}
              className={`py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                activeRightTab === 'Metadata' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              Metadata
              {activeRightTab === 'Metadata' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </button>
            <button 
              onClick={() => setActiveRightTab('Branding')}
              className={`py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                activeRightTab === 'Branding' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              Branding
              {activeRightTab === 'Branding' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </button>
            <button 
              onClick={() => setActiveRightTab('TechPack')}
              className={`py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                activeRightTab === 'TechPack' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              TechPack
              {activeRightTab === 'TechPack' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </button>
            <button 
              onClick={() => setActiveRightTab('Refinements')}
              className={`py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                activeRightTab === 'Refinements' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              Refinements
              {activeRightTab === 'Refinements' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-8 custom-scrollbar transition-all duration-300">
            <AnimatePresence mode="wait">
              {activeRightTab === 'Refinements' ? (
                <motion.div
                  key="refinements"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-0 relative border-l border-slate-100 dark:border-white/5 ml-2"
                >
                  {refinementHistory.map((item, idx) => (
                    <div key={item.id} className="relative pb-10 pl-6 group">
                      <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-white ring-4 ring-white dark:ring-black transition-all" />
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.angle}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-700 font-medium">{item.timestamp}</span>
                        </div>
                        <div className={`p-3 border rounded-lg transition-all flex items-center justify-between gap-3 ${
                          item.isUndone 
                            ? 'bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-60' 
                            : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-all'
                        }`}>
                          <p className={`text-[12px] font-medium leading-relaxed italic flex-1 ${
                            item.isUndone ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-600 dark:text-slate-300'
                          }`}>"{item.change}"</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.isUndone) handleUndo(item.id, item.angle);
                            }}
                            disabled={item.isUndone}
                            className={`shrink-0 flex items-center gap-1 px-1.5 py-1 rounded border text-[9px] font-bold transition-all shadow-sm group/undo ${
                              item.isUndone 
                                ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/20 text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                : 'bg-white dark:bg-black border-slate-200 dark:border-white/20 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/40 transition-all'
                            }`}
                          >
                            <RotateCcw size={10} className={item.isUndone ? '' : 'group-hover/undo:rotate-[-45deg] transition-transform'} />
                            {item.isUndone ? 'UNDONE' : 'UNDO'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="relative pb-4 pl-6 opacity-40">
                    <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-800 ring-4 ring-white dark:ring-black" />
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">INITIAL_GEN</span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-700 font-medium">Oct 24</span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600 italic">Base reconstruction complete from library prompts.</p>
                    </div>
                  </div>
                </motion.div>
              ) : activeRightTab === 'Metadata' ? (
                <motion.div
                  key="metadata"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {metadata.map((item, idx) => (
                    <MetadataFieldCard
                      key={idx}
                      label={item.label}
                      value={item.value}
                      variant="grid-card"
                      confidence={item.confidence}
                      isColor={item.isColor}
                    />
                  ))}
                </motion.div>
              ) : activeRightTab === 'Branding' ? (
                <motion.div 
                  key="branding"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {extractedData.structuredLogos.map((logo, logoIdx) => (
                    <div key={logoIdx} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-[#F8FAFC] dark:bg-bg-elevated space-y-4 shadow-sm dark:shadow-none transition-premium hover:border-slate-300 dark:hover:border-white/20">
                      <div className="flex justify-between items-center border-b border-slate-100/50 dark:border-white/5 pb-2.5">
                        <span className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">{logo.position} Placement</span>
                        <span className="font-mono text-[11px] bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-350 px-2.5 py-0.5 rounded font-bold">{logo.designNumber}</span>
                      </div>
                      
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider uppercase">TREATMENT</span>
                          <span className="font-bold text-slate-800 dark:text-white text-[11.5px] uppercase tracking-wide bg-slate-200/60 dark:bg-white/10 px-2.5 py-1 rounded">{logo.isRaised ? 'Raised Embroidery' : 'Flat Embroidery'}</span>
                        </div>
                        
                        <div className="flex justify-between items-start text-[13px] gap-4">
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider uppercase">DESCRIPTION</span>
                          <span className="font-medium text-slate-700 dark:text-slate-200 text-right text-[12.5px] leading-relaxed max-w-[70%]" title={logo.description}>{logo.description}</span>
                        </div>
                        
                        <div className="flex justify-between items-start text-[13px] gap-4">
                          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider uppercase">COLOR LAYERS</span>
                          <div className="flex flex-wrap gap-1.5 justify-end max-w-[75%]">
                            {logo.colorLayers.map((layer, lIdx) => (
                              <span key={lIdx} className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-200/60 dark:bg-white/10 border border-slate-300/40 dark:border-white/5 text-slate-700 dark:text-slate-300">
                                <span className="h-1.5 w-1.5 rounded-full shadow-sm" style={{ backgroundColor: getColorHex(layer.pms) }} />
                                {layer.description} ({layer.pms})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="techpack"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Master Tech Pack (PDF)</h4>
                    <div className="flex items-center gap-4">
                      <button className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1 hover:underline">
                        <Download size={12} />
                        Download PDF
                      </button>
                      <ExternalLink size={14} className="text-slate-300 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all" />
                    </div>
                  </div>
                  <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden group transition-all duration-300">
                    <img src={images.techPackSource} className="w-full h-auto object-contain cursor-zoom-in group-hover:scale-[1.02] transition-transform duration-500 dark:opacity-70" />
                    <div className="absolute inset-0 bg-black/0 dark:bg-white/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-all" />
                    <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white dark:bg-black shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <Maximize2 size={18} />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <h5 className="text-[12px] font-bold text-slate-900 dark:text-white mb-1">Optical Text Extraction</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">AI has successfully mapped fields from page 2 (Specifications) and page 4 (Colorways).</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Global Page Footer */}
      <div className="h-20 border-t border-slate-100 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl z-20 flex items-center justify-between px-10 shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle2 size={12} />
          </div>
          <span className="text-[12px] font-bold text-slate-900 dark:text-white tracking-tight">Tech Pack successfully rendered.</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onSaveAsDraft}
            className="flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400 h-11 px-[18px] rounded-[12px] text-[13px] font-semibold uppercase tracking-[0.05em] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]"
          >
            Save as Draft
          </button>
          <button 
            onClick={onApprove}
            className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black h-11 px-[18px] rounded-[12px] text-[13px] font-semibold uppercase tracking-[0.05em] hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl shadow-black/10 dark:shadow-none group active:scale-[0.98]"
          >
            Send For Approval
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Image Preview Overlay */}
      <AnimatePresence>
        {isAnalyzingLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/80 dark:bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center transition-all duration-500"
          >
            <div className="max-w-md w-full space-y-8">
              <div className="space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black shadow-xl mx-auto mb-6">
                  <Search size={32} className="animate-pulse text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Intelligence Orchestration</h2>
                <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                  Analysing prompt library to find the dedicated prompt assigned for the cap model
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                  <div className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Linear Search</span>
                  </div>
                  <span className="text-slate-900 dark:text-white">{Math.round(analysisProgress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5 p-[2px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Model Recognition Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center"
            onClick={() => setPreviewIndex(null)}
          >
            {/* Main Preview Area */}
            <div className="relative w-full max-w-6xl flex-1 flex flex-col items-center justify-center p-12">
              <button 
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(null); }}
                className="absolute top-8 right-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10"
              >
                <X size={20} />
              </button>

              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setPreviewIndex(prev => prev! > 0 ? prev! - 1 : previewImages.length - 1); 
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5 backdrop-blur-md"
              >
                <ChevronLeft size={24} />
              </button>

              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setPreviewIndex(prev => prev! < previewImages.length - 1 ? prev! + 1 : 0); 
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5 backdrop-blur-md"
              >
                <ChevronRight size={24} />
              </button>

              <motion.img
                key={previewIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={previewImages[previewIndex].src}
                className="h-[70vh] w-auto max-w-full object-contain drop-shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10">
                <span className="text-[12px] font-bold text-white uppercase tracking-widest">{previewImages[previewIndex].label}</span>
              </div>
            </div>

            {/* Bottom Thumbnails Navigation */}
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="h-32 w-full bg-black/40 border-t border-white/10 flex items-center justify-center gap-3 px-8 shrink-0 backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {previewImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewIndex(idx)}
                  className={`relative aspect-[3/2] h-20 rounded-xl overflow-hidden transition-all ${
                    previewIndex === idx 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105' 
                      : 'opacity-50 hover:opacity-100 hover:scale-105 saturate-0 hover:saturate-100'
                  }`}
                >
                  <img src={img.src} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-[8px] font-bold text-white/90 uppercase tracking-widest block truncate">{img.label}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Refinement Modal */}
      <AnimatePresence>
        {refinePromptIndex !== null && (() => {
          const angleData = getRefineAngleData(refinePromptIndex);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
              onClick={() => {
                setRefinePromptIndex(null);
                setRefineInputValue('');
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                className="w-full max-w-4xl bg-bg-secondary rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.25)] border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col md:flex-row h-[550px] transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left Column: Interactive Visual Reference Preview */}
                <div className="md:w-1/2 bg-slate-50 dark:bg-[#0D1117] p-8 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 animate-in fade-in duration-500">
                  {/* Angle Indicator Tag */}
                  <div className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-white/5 shadow-sm">
                    <Target size={12} className="text-slate-400 dark:text-slate-500" />
                    <span>{angleData.label}</span>
                  </div>
                  
                  {/* Large Centered Premium Cap Angle Image */}
                  <div className="flex-1 flex items-center justify-center p-4 w-full h-full">
                    <img
                      src={angleData.img}
                      alt={angleData.label}
                      className="max-h-[280px] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:scale-105 transition-transform duration-500 ease-out select-none"
                    />
                  </div>

                  {/* Meta Info */}
                  <div className="w-full text-center space-y-1 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {accuracyList[angleData.label] || '98.5% Accuracy'}
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {descriptionList[angleData.label] || 'Product Angle Reconstruction'}
                    </p>
                  </div>
                </div>

                {/* Right Column: Dynamic Form Workspace */}
                <div className="md:w-1/2 p-8 flex flex-col justify-between bg-bg-secondary">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                          <Sparkles size={16} className="text-slate-900 dark:text-white animate-pulse" />
                          Refine View
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          Describe revisions below. The AI model will recalibrate the render mapping.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setRefinePromptIndex(null);
                          setRefineInputValue('');
                        }}
                        className="h-8 w-8 rounded-full border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:text-white/50 dark:hover:text-white transition-all cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Spacious Multi-line Premium Textarea */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Refinement Prompts
                      </label>
                      <textarea
                        autoFocus
                        placeholder="E.g., Increase the lighting on the right side, enhance the contrast of the front logo, and reduce the grain texture of the crown fabric..."
                        className="w-full h-28 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/30 placeholder:text-slate-400 dark:placeholder:white/20 transition-all resize-none leading-relaxed"
                        value={refineInputValue}
                        onChange={(e) => setRefineInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleRefineSubmit(refinePromptIndex);
                          }
                        }}
                      />
                      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
                        <span>Press <kbd className="font-bold bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded">Enter</kbd> to apply</span>
                        <span>{refineInputValue.length} characters</span>
                      </div>
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                        Quick Suggestions
                      </label>
                      <div className="flex flex-wrap gap-2 max-h-[110px] overflow-y-auto pr-1">
                        {[
                          'Enhance logo detail',
                          'Increase exposure',
                          'Reduce fabric grain',
                          'Soften ambient shadows',
                          'Boost stitch contrast',
                          'Adjust visor saturation'
                        ].map((phrase) => (
                          <button
                            key={phrase}
                            type="button"
                            onClick={() => {
                              setRefineInputValue(prev => {
                                const trimmed = prev.trim();
                                if (!trimmed) return phrase;
                                if (trimmed.endsWith('.') || trimmed.endsWith(',')) {
                                  return `${trimmed} ${phrase}`;
                                }
                                return `${trimmed}, ${phrase}`;
                              });
                            }}
                            className="px-3 py-1.5 text-[9px] font-bold tracking-wide uppercase border border-slate-100 dark:border-white/5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-all cursor-pointer"
                          >
                            + {phrase}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Workspace Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5 mt-2">
                    <button
                      onClick={() => {
                        setRefinePromptIndex(null);
                        setRefineInputValue('');
                      }}
                      className="px-5 h-9 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!refineInputValue.trim()}
                      onClick={() => handleRefineSubmit(refinePromptIndex)}
                      className={`px-5 h-9 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        refineInputValue.trim()
                          ? 'bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 cursor-pointer active-scale'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-650 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles size={11} /> Apply Refinement
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
