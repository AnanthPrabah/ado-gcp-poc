import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Maximize2, 
  LayoutGrid, 
  Download, 
  History, 
  Bell, 
  MoreVertical,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
  Eye,
  Settings,
  Share2,
  Plus,
  ZoomIn,
  ZoomOut,
  Terminal,
  Clock,
  CheckCircle2,
  Sparkles,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Asset } from '../../types';
import { galleryImages, galleryAngles, galleryRefinements } from '../../data';

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
  role: string | null;
  activeTab?: string;
}

export default function AssetDetail({ asset, onBack, role, activeTab }: AssetDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [activeTabContent, setActiveTabContent] = useState<'refinements' | 'metadata'>('refinements');
  const isStudioUser = role === 'Prompt Manager';

  const images = galleryImages;
  const angles = galleryAngles;
  const refinements = galleryRefinements;

  const handleNext = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const getBreadcrumbLabel = () => {
    if (!activeTab) return 'Back';
    if (activeTab === 'gallery') return 'Gallery';
    if (activeTab === 'dashboard' || activeTab.startsWith('studio') || activeTab === 'upload') return 'Studio';
    return 'Back';
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-[calc(100vw-64px)] peer-hover:w-[calc(100vw-192px)] mt-16 ml-16 peer-hover:ml-48 overflow-hidden bg-[#F8F9FA] dark:bg-black transition-all duration-300">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar (Secondary) */}
        <div className="flex py-4 items-center justify-between border-b border-slate-100 dark:border-white/5 bg-white dark:bg-black px-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              {getBreadcrumbLabel()}
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">{asset.refId}</span>
          </div>
          
          {/* Actions removed as requested */}
        </div>

        {/* Viewport Area */}
        <div className="flex flex-1 flex-col justify-between items-center p-8 bg-[#F1F5F9]/30 dark:bg-white/[0.02] overflow-hidden relative">
          {/* Studio Controls (Top Left) */}
          {isStudioUser && (
            <div className="absolute top-6 left-6 flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black p-1.5 shadow-sm z-20">
              <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-md transition-all">
                <ZoomIn size={18} />
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-md transition-all border-r border-slate-100 dark:border-white/10 pr-3">
                <ZoomOut size={18} />
              </button>
              <button className="p-2 text-slate-700 dark:text-white bg-slate-100 dark:bg-white/10 rounded-md transition-all px-3">
                <Eye size={18} />
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-md transition-all">
                <LayoutGrid size={18} />
              </button>
            </div>
          )}

          {/* Main Image Viewport with Outside Chevrons - Centered Flex-1 Area */}
          <div className="flex-1 flex items-center justify-center w-full min-h-0 py-4 z-10">
            <div className="flex items-center gap-8 max-w-4xl w-full justify-center min-h-0">
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-slate-400 shadow-sm transition-all hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white active:scale-95 shrink-0 cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="group relative flex aspect-square h-full max-h-[440px] w-full max-w-[440px] flex-col items-center justify-center rounded-2xl overflow-hidden bg-white dark:bg-[#0D1117] shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-all duration-500 border border-slate-200 dark:border-white/10">
                   <img 
                    src={(images[currentImageIndex] as any)?.src || images[currentImageIndex]} 
                    alt={asset.title}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 opacity-100 dark:opacity-90"
                  />
                  
                  {/* Fullscreen Button (Top Right) */}
                  <button className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 dark:bg-black/80 text-slate-900 dark:text-white backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-black transition-all shadow-sm border dark:border-white/10 cursor-pointer">
                    <Maximize2 size={16} />
                  </button>
   
                  <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 dark:bg-black/80 px-3 py-1.5 text-[10px] font-bold text-slate-900 dark:text-white shadow-sm backdrop-blur-md flex items-center gap-1.5 border dark:border-white/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    1024x1024px • 8.4s Gen Time
                  </div>
              </div>
   
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-slate-400 shadow-sm transition-all hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white active:scale-95 shrink-0 cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
   
          {/* Thumbnails Navigator - Statically positioned underneath, NEVER overlapping */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-black/60 p-3 backdrop-blur-xl shadow-sm shrink-0 z-10">
            {images.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-16 w-16 cursor-pointer overflow-hidden rounded-xl transition-all duration-300 relative group/thumb ${
                  currentImageIndex === idx 
                    ? 'ring-2 ring-slate-950 dark:ring-white ring-offset-2 dark:ring-offset-black scale-105 shadow-md' 
                    : 'border border-slate-200 dark:border-white/5 opacity-55 dark:opacity-30 hover:opacity-100 hover:scale-[1.02]'
                }`}
              >
                <img src={(img as any)?.src || img} className="h-full w-full object-cover" />
              </div>
            ))}
            {isStudioUser && (
              <button className="h-16 w-16 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/30 transition-all bg-white/50 dark:bg-white/5 cursor-pointer">
                <Plus size={16} />
                <span className="text-[8px] font-bold uppercase tracking-wider mt-1">Add View</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-[420px] overflow-y-auto border-l border-slate-100 dark:border-white/5 bg-white dark:bg-black px-8 py-10 transition-all duration-300 custom-scrollbar">
        {/* Badge and Version */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
              asset.status?.toLowerCase() === 'approved' || asset.status?.toLowerCase() === 'processed'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                : asset.status?.toLowerCase() === 'draft'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
            }`}>
              {asset.status || 'Approved'}
            </span>
            <span className="text-[14px] font-medium text-slate-400">v2.4</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Title and Meta */}
        <div className="mb-8">
          <h2 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-2">59FIFTY THE ORIGINAL - Arizona Diamondbacks</h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            Generated by <span className="font-medium text-slate-600 dark:text-slate-300">Sarah Jenkins</span> on Oct 24, 2023
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-bg-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated py-3 text-[13px] font-bold tracking-tight text-text-secondary hover:text-text-primary transition-premium cursor-pointer active-scale">
              <Download size={16} /> PNG (Hi-Res)
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-bg-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated py-3 text-[13px] font-bold tracking-tight text-text-secondary hover:text-text-primary transition-premium cursor-pointer active-scale">
              <Download size={16} /> JPG (Web)
            </button>
          </div>
          {asset.status?.toLowerCase() === 'approved' ? (
            <div className="w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 py-3.5 text-[13px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 select-none">
              <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={2.5} />
              Approved Spec (Locked)
            </div>
          ) : (
            <button 
              onClick={() => setIsRefining(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white py-3.5 text-[13px] font-bold uppercase tracking-wider text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 transition-premium shadow-md shadow-slate-900/10 dark:shadow-none cursor-pointer active-scale"
            >
              <Sparkles size={16} /> Refine Generation
            </button>
          )}
        </div>

        <AnimatePresence>
          {isRefining && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-black shadow-2xl border dark:border-white/10"
              >
                <div className="relative p-8">
                  <button 
                    onClick={() => setIsRefining(false)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>

                  <div className="mb-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Refine Asset</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Adjust the prompt to modify the material, color, or lighting of the current asset.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Refinement Prompt</label>
                      <textarea 
                        placeholder="E.g. Change body material to suede and make the logo silver..."
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 min-h-[120px] resize-none"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsRefining(false)}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => setIsRefining(false)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-3.5 text-sm font-bold text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                      >
                        <Send size={16} /> Generate Update
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-100 dark:border-white/5 mb-8 sticky top-0 bg-white dark:bg-black z-10 pt-2 transition-all duration-300">
          <button 
            onClick={() => setActiveTabContent('refinements')}
            className={`flex-1 pb-4 text-[12px] font-bold uppercase tracking-widest transition-all relative ${
              activeTabContent === 'refinements' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Refinements
            {activeTabContent === 'refinements' && (
              <motion.div layoutId="activeTabContent" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white" />
            )}
          </button>
          <button 
            onClick={() => setActiveTabContent('metadata')}
            className={`flex-1 pb-4 text-[12px] font-bold uppercase tracking-widest transition-all relative ${
              activeTabContent === 'metadata' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Metadata
            {activeTabContent === 'metadata' && (
              <motion.div layoutId="activeTabContent" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white" />
            )}
          </button>
        </div>

        <div className="pb-12">
          {activeTabContent === 'refinements' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative space-y-10 pl-6 pr-2">
                {/* Vertical line connector */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100 dark:bg-white/10" />
                
                {refinements.map((ref, idx) => (
                  <div key={idx} className="relative group/refine">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[23px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-black shadow-sm z-10 transition-all ${
                      idx === 0 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800 group-hover/refine:bg-slate-300 dark:group-hover/refine:bg-slate-700'
                    }`} />
                    
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Terminal size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{ref.angle}</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{ref.timestamp}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 transition-all group-hover/refine:border-slate-200 dark:group-hover/refine:border-white/10 group-hover/refine:bg-slate-50 dark:group-hover/refine:bg-white/[0.07]">
                        <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {ref.prompt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <div className="h-5 rounded bg-slate-900 dark:bg-white px-2 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white dark:text-black tracking-widest">{ref.version}</span>
                          </div>
                          {idx === 0 && (
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                          )}
                        </div>
                        <button className="text-[11px] font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all uppercase tracking-widest flex items-center gap-1">
                          <History size={12} />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Base Seed */}
                <div className="relative opacity-60">
                  <div className="absolute -left-[23px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-black bg-slate-100 dark:bg-slate-900 z-10" />
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">A_MODEL_ORIGIN</span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-600">Oct 24</span>
                  </div>
                  <p className="text-[12px] text-slate-400 dark:text-slate-600 italic">Initial generation from library parameters.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {isStudioUser && (
                <div className="space-y-10">
                  {/* Prompt Lineage */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Zap size={16} className="text-[#8B5CF6]" />
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Prompt Lineage</h3>
                    </div>
                    <div className="rounded-xl bg-[#F5F3FF] dark:bg-white/5 p-6 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 font-mono border border-[#DDD6FE] dark:border-white/10">
                      <span className="text-[#8B5CF6] dark:text-purple-400 font-bold">/imagine</span> prompt: Photorealistic product shot of a New Era 59FIFTY fitted cap. <span className="bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded shadow-sm font-bold text-slate-900 dark:text-white">Color: Midnight Black</span>. Front logo: Arizona Diamondbacks "A" logo with snakehead in metallic red and teal 3D embroidery. <span className="bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded shadow-sm font-bold text-slate-900 dark:text-white">Material: Performance Polyester</span>. Studio lighting, dark minimalist background, rim light on visor edge. --ar 4:3 --v 5.2 --style raw
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Brand Accuracy (Diamondbacks)</span>
                        <span className="text-[12px] font-bold text-emerald-500">98%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Material Fidelity (Wool)</span>
                        <span className="text-[12px] font-bold text-blue-500">92%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Style Details */}
              <div className="space-y-6">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white font-sans">Style Characteristics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#F8FAFC] dark:bg-white/[0.01] p-4.5 border border-slate-200/60 dark:border-white/5">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">SKU Base</span>
                    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">59FIFTY-BASE-01</span>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] dark:bg-white/[0.01] p-4.5 border border-slate-200/60 dark:border-white/5">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">Collection</span>
                    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Heritage Q3</span>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] dark:bg-white/[0.01] p-4.5 border border-slate-200/60 dark:border-white/5">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">Crown Profile</span>
                    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">High Structured</span>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] dark:bg-white/[0.01] p-4.5 border border-slate-200/60 dark:border-white/5">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">Visor</span>
                    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Flat (Curvable)</span>
                  </div>
                </div>

                <div className="mt-4 pt-10 border-t border-slate-100 dark:border-white/5">
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-8 font-sans">Approval History</h3>
                  <div className="relative space-y-10 pl-6">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100 dark:bg-white/5" />
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-black bg-[#10B981] shadow-sm z-10" />
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[14px] font-bold text-slate-900 dark:text-white">v2.4 (Approved)</span>
                        <span className="text-[12px] text-slate-400 dark:text-slate-500">2 hrs ago</span>
                      </div>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Design Review Batch #881. Final verification of color reproduction across all gamuts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
