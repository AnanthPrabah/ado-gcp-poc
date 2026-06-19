import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Upload, 
  MoreVertical, 
  Filter,
  Search,
  ArrowUpRight,
  Database,
  Activity,
  Layers,
  LayoutGrid,
  List,
  ChevronRight,
  Pause,
  Loader2,
  Zap,
  Box,
  Eye,
  FileText,
  Download,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronsUpDown,
  Target,
  ChevronLeft,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageShell from '../layout/PageShell';
import StatusBadge from '../ui/StatusBadge';

import { batches as centralizedBatches, batchDetailItems as centralizedBatchDetailItems, reviewPreviewImages as centralizedPreviewImages, images } from '../../data';
import { validateTechPackFile, validateTechPackData } from '../../services/fileValidator';

const batches = centralizedBatches;
const batchDetailItems = [
  { id: 'B-117-X', styleRange: '59FIFTY', throughput: 'LA DODGERS HOME ROYAL', status: 'SCANNING', progress: 12, sla: 'Pending', slaColor: 'bg-slate-300', icon: <Loader2 size={12} className="animate-spin" />, color: 'text-blue-500' },
  { id: 'B-117-Y', styleRange: '59FIFTY', throughput: 'NY YANKEES NAVY CLASSIC', status: 'EXTRACTING', progress: 45, sla: 'On Track', slaColor: 'bg-emerald-500', icon: <Zap size={12} />, color: 'text-cyan-600' },
  { id: 'B-117-Z', styleRange: '59FIFTY', throughput: 'CHICAGO CUBS GAME BLUE', status: 'RENDERING', progress: 89, sla: 'On Track', slaColor: 'bg-emerald-500', icon: <Box size={12} />, color: 'text-teal-600' },
  { id: 'B-117-E', styleRange: '59FIFTY', throughput: 'BOSTON RED SOX SCARLET', status: 'HALTED', progress: 50, sla: 'Failed', slaColor: 'bg-rose-500', icon: <AlertCircle size={12} />, color: 'text-rose-500', isFailed: true },
  { id: 'B-117-C', styleRange: '59FIFTY', throughput: 'SF GIANTS BLACK ORANGE', status: 'COMPLETED', progress: 100, sla: 'On Track', slaColor: 'bg-emerald-500', icon: <CheckCircle2 size={12} />, color: 'text-emerald-600' },
];

export default function BatchOrchestration({ initialView = 'main', onTabChange, role }: { initialView?: 'main' | 'detail' | 'preview' | 'exceptions' | 'presets', onTabChange?: (tab: string) => void, role?: string | null }) {
  const [view, setView] = useState<'main' | 'detail' | 'preview' | 'exceptions' | 'presets'>(initialView);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedBatch, setSelectedBatch] = useState<typeof batches[0]>(batches[0]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [refinePromptIndex, setRefinePromptIndex] = useState<number | null>(null);
  const [refiningStates, setRefiningStates] = useState<Record<number, boolean>>({});
  const [refineInputValue, setRefineInputValue] = useState('');
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);

  const isCreativeUser = role === 'Creative User';

  useEffect(() => {
    // Prevent access to exceptions for Creative Users
    if (isCreativeUser && initialView === 'exceptions') {
      setView('main');
    } else {
      setView(initialView);
    }
  }, [initialView, isCreativeUser]);

  const handleRefineSubmit = (idx: number) => {
    setRefineInputValue('');
    setRefinePromptIndex(null);
    setRefiningStates(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setRefiningStates(prev => ({ ...prev, [idx]: false }));
    }, 2500);
  };

  const previewImages = centralizedPreviewImages;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const anglesList = [
    'SIDE_LEFT',
    'REAR_VIEW',
    'SIDE_RIGHT',
    'ISO_RIGHT',
    'UNDRV_GRY',
    'INT_SWEAT'
  ];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const validation = await validateTechPackFile(file);
        if (!validation.valid) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: `File "${file.name}" is invalid: ${validation.error || 'Invalid file.'}`,
              type: 'error'
            }
          }));
          e.target.value = ''; // Reset input
          return;
        }
      }

      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false);
        setSelectedBatch(batches[0]);
        setView('detail');
      }, 1500);
    }
  };

  const getDynamicBatchItems = (batch: typeof batches[0]) => {
    const count = parseInt(batch.throughput);
    const statuses = ['COMPLETED', 'SCANNING', 'EXTRACTING', 'RENDERING', 'HALTED'];
    const icons = [
      <CheckCircle2 size={12} />,
      <Loader2 size={12} className="animate-spin" />,
      <Zap size={12} />,
      <Box size={12} />,
      <AlertCircle size={12} />
    ];
    const colors = ['text-emerald-600', 'text-blue-500', 'text-cyan-600', 'text-teal-600', 'text-rose-500'];
    const slaColors = ['bg-emerald-500', 'bg-slate-300', 'bg-emerald-500', 'bg-emerald-500', 'bg-rose-500'];
    const slaTexts = ['On Track', 'Pending', 'On Track', 'On Track', 'Failed'];

    return Array.from({ length: count }).map((_, i) => {
      const statusIdx = i % statuses.length;
      const isCompleted = statuses[statusIdx] === 'COMPLETED';
      return {
        id: `${batch.id}-${String.fromCharCode(88 + (i % 3))}${i > 2 ? i : ''}`,
        styleRange: batch.styleRange,
        throughput: i === 0 ? 'LA DODGERS HOME ROYAL' : i === 1 ? 'NY YANKEES NAVY CLASSIC' : 'TEAM VARIANT STYLE',
        status: statuses[statusIdx],
        progress: isCompleted ? 100 : Math.floor(Math.random() * 90) + 10,
        sla: slaTexts[statusIdx],
        slaColor: slaColors[statusIdx],
        icon: icons[statusIdx],
        color: colors[statusIdx],
        isFailed: statuses[statusIdx] === 'HALTED'
      };
    });
  };

  const currentBatchItems = getDynamicBatchItems(selectedBatch);

  if (view === 'exceptions') {
    return (
      <PageShell>
        <div className="w-full py-8 px-8">
          <div className="mb-8">
            <h1 className="heading-primary leading-tight">Exception Queue</h1>
            <p className="text-[14px] text-text-secondary font-medium mt-1 font-sans">Manage unmapped logic and low-confidence classification matches.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[
                { id: 'E-442', variant: '59FIFTY', feature: 'Gold Metallic Embroidery', confidence: '42%', source: 'Easy Ingest' },
                { id: 'E-443', variant: '9FORTY', feature: 'Velcro Closure with Emboss', confidence: '31%', source: 'Easy Ingest' },
                { id: 'E-444', variant: '59FIFTY', feature: 'Diamond Pattern Mesh Side', confidence: '12%', source: 'Easy Ingest' },
              ].map((item) => (
                <div key={item.id} className="premium-card p-6 flex items-center justify-between group cursor-default">
                  <div className="flex gap-6 items-center">
                    <div className="h-12 w-12 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-bold text-text-primary">{item.id}</span>
                        <span className="px-2 py-0.5 rounded bg-bg-primary text-[10px] font-bold text-text-secondary uppercase tracking-widest">{item.variant}</span>
                      </div>
                      <p className="text-[13px] text-text-secondary mt-1">Feature: <span className="text-text-primary font-medium">{item.feature}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Confidence</span>
                      <span className="text-[14px] font-bold text-rose-500">{item.confidence}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-[10px] font-bold uppercase tracking-widest px-4 h-9 rounded-lg bg-text-primary text-bg-primary hover:opacity-90 transition-all font-sans">Map Preset</button>
                      <button className="text-[10px] font-bold uppercase tracking-widest px-4 h-9 rounded-lg border border-border-primary text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all font-sans">Park</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="premium-card bg-[#0D1117] text-white dark:bg-bg-secondary p-6 flex flex-col justify-between h-[230px]">
                <div>
                  <Sparkles className="text-blue-400 mb-4" size={24} />
                  <h3 className="text-[16px] font-bold mb-2">Missing Prompt?</h3>
                  <p className="text-slate-400 dark:text-text-secondary text-[12px] leading-relaxed mb-6 font-medium">If no suitable prompt exists for an exception, you can raise a training request for prompt authors.</p>
                </div>
                <button className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all shadow-md active:scale-95">Raise Training Request</button>
              </div>

              <div className="premium-card p-6">
                 <h4 className="text-[12px] font-bold text-text-tertiary uppercase tracking-widest mb-4">Pipeline Health</h4>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-[13px] text-text-secondary font-medium">Auto-Map Rate</span>
                     <span className="text-[13px] text-emerald-500 font-bold">94.2%</span>
                   </div>
                   <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[94%]" />
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (view === 'presets') {
    return (
      <PageShell>
        <div className="w-full py-8 px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="heading-primary leading-tight">Prompt Presets</h1>
              <p className="text-[14px] text-text-secondary font-medium mt-1 font-sans">Manage and review prompt mappings for automatic ingestion.</p>
            </div>
            <button className="btn-upload active:scale-95 shadow-sm">REQUEST NEW PRESET</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Standard 59FIFTY Crown', type: 'Mesh/Solid', usage: '48.2k', stability: '99.9%' },
              { name: 'Metallic Stitching V2', type: 'Detail', usage: '12.1k', stability: '98.5%' },
              { name: 'Contrast Visor Pattern', type: 'Pattern', usage: '8.4k', stability: '99.2%' },
              { name: 'Inside Tech Labels', type: 'Internal', usage: '22.9k', stability: '99.5%' },
              { name: '3D Puff Embroidery', type: 'Detail', usage: '31.2k', stability: '97.8%' },
              { name: 'Standard 9FORTY Profile', type: 'Crown', usage: '18.5k', stability: '99.7%' },
            ].map((preset, idx) => (
              <div key={idx} className="premium-card p-6 flex flex-col justify-between group cursor-default">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-10 w-10 rounded-lg bg-bg-primary flex items-center justify-center text-text-tertiary group-hover:bg-text-primary group-hover:text-bg-primary transition-all">
                      <Target size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">Active</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-text-primary mb-1">{preset.name}</h3>
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">{preset.type}</span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border-primary grid grid-cols-2 gap-4">
                   <div>
                     <span className="block text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Total Usage</span>
                     <span className="text-[14px] font-bold text-text-primary">{preset.usage}</span>
                   </div>
                   <div>
                     <span className="block text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Stability</span>
                     <span className="text-[14px] font-bold text-text-primary">{preset.stability}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  if (view === 'preview') {
    return (
      <PageShell>
        <div className="w-full py-8 px-8 bg-bg-primary min-h-screen flex justify-center">
          <div className="w-full max-w-5xl flex flex-col gap-6">
            
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                {/* Breadcrumb Trail Stacked Vertically Above Heading */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 select-none">
                  <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors" onClick={() => setView('main')}>Batches</span>
                  <span className="text-slate-300 dark:text-slate-700">/</span>
                  <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors" onClick={() => setView('detail')}>{selectedBatch.id}</span>
                  <span className="text-slate-300 dark:text-slate-700">/</span>
                  <span className="text-text-primary">{selectedItem?.id}</span>
                </div>

                <h1 className="text-[20px] font-bold text-text-primary tracking-tight leading-none animate-in fade-in duration-300">Batch Preview</h1>
                <p className="text-[11px] text-text-tertiary font-medium mt-1.5">Review and refine AI-generated photo-realistic product angles from tech pack ingestion.</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                  className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-white/10 bg-bg-secondary hover:bg-slate-50 dark:hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-[12px] font-bold uppercase tracking-wider transition-premium cursor-pointer active-scale shadow-sm focus-ring group"
                >
                  <Download size={14} className="shrink-0 text-text-tertiary group-hover:text-text-primary transition-premium" />
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
                          <span className="font-bold tracking-tight">ALL_ASSETS (.ZIP)</span>
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

            {/* Master Viewport Panel */}
            <div className="relative aspect-[16/10] rounded-2xl border border-border-primary bg-bg-secondary overflow-hidden group shadow-sm hover:shadow-md transition-premium">
              
              {/* Image Rendering / Loading overlay */}
              {refiningStates[activeAngleIndex] ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-primary/80 dark:bg-black/80 z-20 transition-all">
                  <Loader2 className="animate-spin text-text-tertiary mb-3" size={28} />
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest animate-pulse mt-2">
                    Refining Volumetric Mesh...
                  </span>
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center p-8 bg-gradient-to-b from-bg-secondary to-bg-primary/10">
                  <img 
                    src={previewImages[activeAngleIndex]?.src} 
                    className="h-full max-h-[85%] w-auto object-contain animate-in fade-in zoom-in-95 duration-500 opacity-95 dark:opacity-85" 
                  />
                </div>
              )}

              {/* Viewport Info HUD Overlays */}
              <div className="absolute top-4 left-4 bg-bg-secondary/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border-primary shadow-sm z-10 transition-premium">
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest block">
                  {previewImages[activeAngleIndex]?.label?.toUpperCase()}
                </span>
                <span className="text-[8px] font-bold text-text-tertiary uppercase tracking-wider block mt-0.5">
                  {[
                    'Primary Orthographic Profile',
                    'Right Perspective View',
                    'Left Perspective View',
                    'Left Orthogonal Profile',
                    'Right Orthogonal Profile',
                    'Rear Orthogonal Profile',
                    'Under-Visor and Stitching View'
                  ][activeAngleIndex]}
                </span>
              </div>

              <div className="absolute top-4 right-4 z-10">
                <span className="flex items-center gap-1.5 text-[8px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1.5 rounded-xl border border-blue-500/20 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> Model Active
                </span>
              </div>

              {/* Accuracy Badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm z-10">
                <CheckCircle2 size={12} />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {[
                    '99.8% Accuracy',
                    '99.2% Accuracy',
                    '98.9% Accuracy',
                    '99.1% Accuracy',
                    '99.4% Accuracy',
                    '98.5% Accuracy',
                    '97.8% Accuracy'
                  ][activeAngleIndex]} Reconstruction Accuracy
                </span>
              </div>

              {/* Hover Actions Trigger Overlay */}
              {!refiningStates[activeAngleIndex] && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1.5px] flex items-center justify-center z-10 pointer-events-none">
                  <div className="flex flex-col gap-2.5 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPreviewIndex(activeAngleIndex); }} 
                      className="bg-bg-secondary text-text-primary px-6 py-2.5 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-premium hover:scale-105 active:scale-95 border border-border-primary focus-ring"
                    >
                      <Maximize2 size={12} className="text-text-secondary" /> Expand Canvas
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRefinePromptIndex(activeAngleIndex); }} 
                      className="bg-text-primary text-bg-primary px-6 py-2.5 rounded-xl shadow-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-premium hover:scale-105 active:scale-95 focus-ring"
                    >
                      <Sparkles size={12} /> Refine Angle
                    </button>
                  </div>
                </div>
              )}

              {/* Prompt Overlay */}
              <AnimatePresence>
                {refinePromptIndex === activeAngleIndex && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 gap-4">
                    <button onClick={(e) => { e.stopPropagation(); setRefinePromptIndex(null); }} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={16} /></button>
                    <span className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-blue-400 animate-pulse" /> Refine Generation</span>
                    <div className="relative w-full max-w-xs">
                      <input 
                        type="text" 
                        autoFocus 
                        placeholder="E.g., Increase edge sharpness..." 
                        className="w-full bg-white/10 border border-white/20 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-white/40" 
                        value={refineInputValue}
                        onChange={(e) => setRefineInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit(activeAngleIndex)} 
                      />
                      <button onClick={() => handleRefineSubmit(activeAngleIndex)} className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all active:scale-95"><ArrowRight size={16} /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Symmetrical Thumbnails Selection Tray */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border-primary pb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Inspection Viewports</span>
                  <span className="text-[11px] text-text-secondary font-medium">Select a viewport angle to load model data into the primary canvas.</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-tertiary uppercase tracking-widest bg-bg-secondary px-2.5 py-1 rounded-xl border border-border-primary">
                  <span className="text-text-primary">7 Views</span> Ready
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 w-full">
                {previewImages.map((angle, idx) => {
                  const isSelected = activeAngleIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveAngleIndex(idx)}
                      className={`relative aspect-[4/3] rounded-2xl border bg-bg-secondary overflow-hidden group transition-premium flex flex-col items-center justify-center p-2 cursor-pointer text-left focus:outline-none focus-ring ${
                        isSelected 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/5 hover:scale-100' 
                          : 'border-border-primary hover:border-text-tertiary hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      {refiningStates[idx] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-primary/80 z-10">
                          <Loader2 className="animate-spin text-text-tertiary" size={12} />
                        </div>
                      ) : (
                        <img src={angle.src} className="h-full w-full object-contain opacity-85 group-hover:opacity-100 transition-opacity p-2" />
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/90 to-transparent pt-6 pb-2 px-2 flex flex-col gap-0.5">
                        <span className={`text-[8px] font-bold uppercase tracking-wide truncate ${isSelected ? 'text-emerald-500' : 'text-text-secondary group-hover:text-text-primary'}`}>{angle.label}</span>
                        <span className="text-[7px] text-text-tertiary font-bold tracking-wider">
                          {[
                            '99.8% Acc',
                            '99.2% Acc',
                            '98.9% Acc',
                            '99.1% Acc',
                            '99.4% Acc',
                            '98.5% Acc',
                            '97.8% Acc'
                          ][idx]}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symmetrical Floating View Controls & Asset Health */}
            <div className="premium-card p-6 gap-6 grid grid-cols-1 md:grid-cols-2 glass">
              <div>
                <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-4">View Controls</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border-primary text-[11px] font-bold text-text-primary bg-bg-secondary hover:bg-bg-elevated transition-premium uppercase tracking-widest active:scale-95 shadow-sm focus-ring">
                    <RotateCcw size={14} className="text-text-secondary" />
                    Recalibrate Viewports
                  </button>
                  <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-text-primary text-bg-primary text-[11px] font-bold hover:opacity-90 transition-premium uppercase tracking-widest active:scale-[0.97] shadow-lg shadow-text-primary/10 focus-ring">
                    <Target size={14} />
                    Refocus Model
                  </button>
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-border-primary pt-6 md:pt-0 md:pl-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Asset Health Profile</span>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-bg-secondary/50 border border-border-primary/50">
                    <span className="text-[11px] font-medium text-text-secondary">Mesh Density</span>
                    <span className="text-[11px] font-bold text-text-primary">854k Poly</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-bg-secondary/50 border border-border-primary/50">
                    <span className="text-[11px] font-medium text-text-secondary">Texture Spec</span>
                    <span className="text-[11px] font-bold text-text-primary">8K (PBR)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Image Preview Lightbox Overlay */}
        <AnimatePresence>
          {previewIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center"
              onClick={() => setPreviewIndex(null)}
            >
              {/* Main Preview Area */}
              <div className="relative w-full max-w-6xl flex-1 flex flex-col items-center justify-center p-12">
                <button 
                  onClick={(e) => { e.stopPropagation(); setPreviewIndex(null); }}
                  className="absolute top-8 right-8 h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-premium border border-white/10 active:scale-90 focus-ring"
                >
                  <X size={20} />
                </button>

                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setPreviewIndex(prev => prev! > 0 ? prev! - 1 : previewImages.length - 1); 
                  }}
                  className="absolute left-8 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-premium border border-white/5 backdrop-blur-md active:scale-90 focus-ring"
                >
                  <ChevronLeft size={24} />
                </button>

                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setPreviewIndex(prev => prev! < previewImages.length - 1 ? prev! + 1 : 0); 
                  }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-premium border border-white/5 backdrop-blur-md active:scale-90 focus-ring"
                >
                  <ChevronRight size={24} />
                </button>

                <motion.img
                  key={previewIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  src={previewImages[previewIndex]?.src}
                  className="h-[65vh] w-auto max-w-full object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{previewImages[previewIndex]?.label}</span>
                </div>
              </div>

              {/* Bottom Thumbnails Navigation */}
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="h-32 w-full bg-white/5 border-t border-white/5 flex items-center justify-center gap-4 px-8 shrink-0 backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {previewImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPreviewIndex(idx)}
                    className={`relative aspect-[3/2] h-20 rounded-xl overflow-hidden transition-premium focus-ring ${
                      previewIndex === idx 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105 shadow-lg' 
                        : 'opacity-40 hover:opacity-100 hover:scale-105 saturate-50 hover:saturate-100'
                    }`}
                  >
                    <img src={img.src} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                      <span className="text-[8px] font-bold text-white/90 uppercase tracking-widest block truncate">{img.label}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageShell>
    );
  }

  if (view === 'detail') {
    return (
      <PageShell>
        <div className="flex h-12 flex-none items-center border-b border-border-primary bg-bg-secondary px-8">
          <div className="flex items-center gap-2.5 text-[13px] font-semibold text-text-secondary">
            <button onClick={() => setView('main')} className="transition-premium hover:text-text-primary">Batches</button>
            <ChevronRight size={14} className="text-text-tertiary pb-[1px]" />
            <span className="font-bold text-text-primary tracking-tight">{selectedBatch.id}</span>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto py-8 px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="heading-primary leading-tight">{selectedBatch.id}</h1>
            <button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className="btn-upload active:scale-95 shadow-sm"
            >
              {isUploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              {isUploading ? 'PREPARING BATCH...' : 'UPLOAD NEW BATCH'}
            </button>
          </div>

          {/* Real-Time Progress Card */}
          <div className="bg-bg-table rounded-xl border border-border-primary shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-4 border-b border-border-primary bg-bg-tertiary gap-4">
              <h2 className="heading-section">Real-Time Progress</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search progress..." 
                    className="pl-9 pr-4 py-1.5 bg-white dark:bg-[#0D1117] border border-border-primary rounded-lg text-xs focus:outline-none focus:border-transparent focus:shadow-[0_0_0_2px_rgba(15,23,42,.08)] dark:focus:shadow-[0_0_0_2px_rgba(255,255,255,.08)] w-48 text-text-primary" 
                  />
                </div>
                <button className="flex items-center gap-2 px-3 h-[36px] rounded-lg border border-border-primary text-[11px] font-semibold text-text-secondary uppercase bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-premium active:scale-95 duration-150">
                  <Pause size={12} fill="currentColor" />
                  Pause All
                </button>
                <button className="text-text-tertiary hover:text-text-primary transition-colors">
                  <Filter size={18} />
                </button>
                <button className="text-text-tertiary hover:text-text-primary transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-primary bg-bg-tertiary/50">
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] cursor-pointer">BATCH ID</th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] cursor-pointer">STYLE RANGE</th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] cursor-pointer">TECHPACK</th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] cursor-pointer">STATUS & PROGRESS</th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] cursor-pointer">SLA STATUS</th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary border-b border-border-primary">
                  {currentBatchItems.map((item) => (
                    <tr key={item.id} className="group table-row-hover transition-premium h-[76px] border-b border-border-primary">
                      <td className="px-8 py-0">
                        <span className={`text-[14px] font-bold ${item.status === 'HALTED' ? 'text-rose-500 underline underline-offset-4' : 'text-text-primary font-bold'}`}>{item.id}</span>
                      </td>
                      <td className="px-8 py-0">
                        <span className="text-[14px] font-medium text-text-secondary tracking-tight">{item.styleRange}</span>
                      </td>
                      <td className="px-8 py-0 font-mono text-left">
                        <span className={`text-[14px] font-bold ${item.throughput === '0/hr' ? 'text-rose-500' : 'text-text-primary'}`}>{item.throughput}</span>
                      </td>
                      <td className="px-8 py-0 min-w-[300px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2 text-[10px] font-bold tracking-widest ${item.color}`}>
                              {item.icon}
                              {item.status}
                            </div>
                            <span className="text-[10px] font-bold text-text-tertiary">{item.status === 'HALTED' ? 'Failed' : `${item.progress}%`}</span>
                          </div>
                          <div className="relative h-1 w-full bg-bg-primary rounded-full overflow-hidden">
                            <motion.div 
                              className={`absolute inset-y-0 left-0 ${item.isFailed ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : item.progress === 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-cyan-600 shadow-[0_0_8px_rgba(8,145,178,0.5)]'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-0">
                        <div className="flex items-center gap-2">
                           <div className={`h-2 w-2 rounded-full ${item.slaColor}`} />
                           <span className="text-[13px] font-medium text-text-secondary">{item.sla}</span>
                        </div>
                      </td>
                      <td className="px-8 py-0 text-right">
                        <div className="flex justify-end">
                          {item.status === 'HALTED' ? (
                            <button className="px-4 py-1.5 border border-rose-200 dark:border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300 transition-premium active:scale-95 shadow-sm">Review</button>
                          ) : item.status === 'COMPLETED' ? (
                            <button 
                              onClick={() => {
                                setSelectedItem(item);
                                setView('preview');
                              }}
                              className="px-4 py-1.5 border border-border-primary text-text-secondary text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-50 dark:hover:bg-bg-elevated hover:text-text-primary transition-premium active:scale-95 shadow-sm"
                            >
                              View
                            </button>
                          ) : (
                            <button disabled className="px-4 py-1.5 border border-border-primary/50 text-text-tertiary text-[10px] font-bold uppercase tracking-widest rounded-lg cursor-not-allowed opacity-50 bg-bg-secondary/50">View</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full py-8 px-8">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 id="batch-orchestration-heading" className="heading-primary leading-tight">Batches</h1>
            <p className="text-[14px] text-text-secondary font-medium mt-1">Operational view & pipeline throughput management.</p>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              onChange={handleFileChange}
              accept=".pdf"
            />
            <button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className="btn-upload active:scale-95 shadow-sm"
            >
              {isUploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              {isUploading ? 'PREPARING BATCH...' : 'UPLOAD BATCH'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Active Batches', value: '1,248', change: '+12%', icon: <Layers size={16} className="stroke-[1.8]" />, trend: 'up' },
            { label: 'Processing (Assets)', value: '84.5k', change: '@ 1.2k/hr', icon: <Activity size={16} className="stroke-[1.8]" />, trend: 'neutral' },
            { label: 'Queued', value: '312', change: 'Pending allocation', icon: <Database size={16} className="stroke-[1.8]" />, trend: 'neutral' },
            { 
              label: 'Exceptions', 
              value: '14', 
              change: isCreativeUser ? 'Detected' : 'Action Required', 
              icon: <AlertCircle size={16} className="stroke-[1.8]" />, 
              onClick: () => !isCreativeUser && onTabChange?.('exceptions'),
              cursorStyle: isCreativeUser ? 'cursor-default' : 'cursor-pointer hover:border-rose-300 dark:hover:border-rose-500/20 hover:scale-[1.01] transition-all',
              trend: 'danger'
            },
          ].map((metric, i) => (
            <div 
              key={i} 
              onClick={metric.onClick}
              className={`premium-card h-[128px] p-5 flex flex-col justify-between ${metric.cursorStyle || 'cursor-default'}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-[12px] font-semibold text-text-tertiary uppercase tracking-[0.04em]">{metric.label}</p>
                <div className="text-text-tertiary transition-colors duration-200">
                  {metric.icon}
                </div>
              </div>

              <div className="flex items-baseline gap-2.5">
                <h3 className={`text-[36px] font-bold leading-none tracking-[-0.03em] ${metric.label === 'Exceptions' ? 'text-rose-500' : 'text-text-primary'}`}>{metric.value}</h3>
              </div>

              <div className="flex items-center gap-1.5">
                {metric.trend === 'up' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20">
                    <ArrowUpRight size={10} className="stroke-[2.5] mr-0.5" />
                    {metric.change}
                  </span>
                ) : metric.trend === 'danger' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100/50 dark:border-rose-500/20">
                    {metric.change}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 dark:bg-white/5 text-text-secondary border border-border-primary">
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recently Batches Table */}
        <div className="bg-bg-table w-full border border-border-primary shadow-sm rounded-xl">
          {/* Toolbar */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-between border-b border-border-primary bg-bg-tertiary gap-4 rounded-t-xl">
            <h2 className="heading-section">Recent Batches</h2>
            <div className="flex items-center gap-4 overflow-x-auto">
              <div className="relative w-full md:w-[240px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input 
                  type="text" 
                  placeholder="Search file name..." 
                  className="w-full pl-9 pr-4 h-[42px] border border-border-primary rounded-lg text-[13px] text-text-primary bg-white dark:bg-[#0D1117] placeholder:text-text-tertiary focus:outline-none focus:border-transparent focus:shadow-[0_0_0_2px_rgba(15,23,42,.08)] dark:focus:shadow-[0_0_0_2px_rgba(255,255,255,.08)] transition-all duration-200" 
                />
              </div>
              <span className="text-[13px] font-semibold text-text-secondary whitespace-nowrap">Filter By:</span>
              <button className="flex items-center gap-2 border border-border-primary h-[42px] px-4 rounded-lg text-[13px] text-text-secondary font-semibold bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all duration-200">
                <Box size={13} className="text-text-tertiary" /> Category <ChevronDown size={13} className="text-text-tertiary" />
              </button>
              <button className="flex items-center gap-2 border border-border-primary h-[42px] px-4 rounded-lg text-[13px] text-text-secondary font-semibold bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all duration-200">
                <Activity size={13} className="text-text-tertiary" /> Status <ChevronDown size={13} className="text-text-tertiary" />
              </button>
              <div className="w-px h-6 bg-border-primary mx-1 shrink-0"></div>
              <div className="flex bg-bg-primary border border-border-primary rounded-lg overflow-hidden shrink-0 transition-all p-0.5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all active:scale-95 ${viewMode === 'grid' 
                    ? 'bg-white dark:bg-bg-elevated border border-border-primary dark:border-white/5 text-text-primary shadow-sm' 
                    : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  <LayoutGrid size={13} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all active:scale-95 ${viewMode === 'list' 
                    ? 'bg-white dark:bg-bg-elevated border border-border-primary dark:border-white/5 text-text-primary shadow-sm' 
                    : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {viewMode === 'list' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-primary bg-bg-tertiary/50">
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] cursor-pointer">
                      <div className="flex items-center gap-2">
                        BATCH ID <ChevronsUpDown size={12} className="text-text-tertiary" />
                      </div>
                    </th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] cursor-pointer">
                      <div className="flex items-center gap-2">
                        STYLE RANGE <ChevronsUpDown size={12} className="text-text-tertiary" />
                      </div>
                    </th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] cursor-pointer">
                      <div className="flex items-center gap-2">
                        TECHPACK COUNT <ChevronsUpDown size={12} className="text-text-tertiary" />
                      </div>
                    </th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] text-center">
                      <div className="flex items-center justify-center gap-2">
                        STATUS <ChevronsUpDown size={12} className="text-text-tertiary" />
                      </div>
                    </th>
                    <th className="px-8 py-3 text-[12px] font-semibold text-[#667085] uppercase tracking-[0.08em] text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary border-b border-border-primary">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="group table-row-hover transition-premium h-[76px] border-b border-border-primary">
                      <td className="px-8 py-0">
                        <span className="text-[14px] font-bold text-text-primary">{batch.id}</span>
                      </td>
                      <td className="px-8 py-0">
                        <span className="text-[14px] font-medium text-text-secondary tracking-tight">{batch.styleRange}</span>
                      </td>
                      <td className="px-8 py-0">
                        <span className={`text-[14px] font-bold ${batch.type === 'danger' ? 'text-rose-500' : 'text-text-primary'}`}>{batch.throughput}</span>
                      </td>
                      <td className="px-8 py-0">
                        <div className="flex justify-center">
                          <StatusBadge status={batch.status} variant={batch.type} />
                        </div>
                      </td>
                      <td className="px-8 py-0 text-right">
                        <button 
                          onClick={() => {
                            setSelectedBatch(batch);
                            setView('detail');
                          }}
                          className={`text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-lg border transition-premium active:scale-95 shadow-sm ${
                            batch.type === 'danger' 
                              ? 'border-rose-200 dark:border-rose-500/20 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300'
                              : 'border-border-primary text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated hover:text-text-primary'
                          }`}
                        >
                          {batch.type === 'danger' ? 'Resolve' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-bg-tertiary/20 border-b border-border-primary">
                {batches.map((batch) => (
                  <div key={batch.id} onClick={() => { setSelectedBatch(batch); setView('detail'); }} className="premium-card p-0 overflow-hidden hover:border-text-secondary/30 transition-premium group flex flex-col h-full relative cursor-pointer active:scale-[0.99]">
                    <div className="w-full relative bg-bg-tertiary overflow-hidden flex-shrink-0" style={{ paddingBottom: '70%' }}>
                      <img src={images.capFront} alt={batch.id} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700" />
                      <div className="absolute top-3 right-3 z-10">
                        <StatusBadge status={batch.status} variant={batch.type} />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h4 className="text-[12px] font-bold text-text-primary leading-snug mb-1">{batch.id}</h4>
                      <p className="text-[11px] text-text-tertiary mb-4 truncate">{batch.styleRange}</p>
                      <div className="mt-auto pt-3 border-t border-border-primary flex items-center justify-between text-[11px] text-text-tertiary font-semibold">
                        <span>{batch.throughput} Assets</span>
                        <span>{batch.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between border-t border-border-primary px-8 py-4 bg-transparent rounded-b-xl">
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-text-secondary font-medium whitespace-nowrap">
                Showing 1 to {batches.length} of {batches.length} uploads
              </span>
              <div className="relative">
                <button className="flex items-center gap-1.5 border border-border-primary px-2.5 h-8 rounded-lg text-[12px] text-text-secondary font-semibold bg-bg-secondary hover:text-text-primary transition-all active:scale-95 duration-150">
                  {batches.length} <ChevronDown size={12} className="text-text-tertiary" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button disabled className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-primary/50 bg-bg-secondary/50 text-text-tertiary transition-all cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              <button className="h-8 w-8 rounded-lg bg-text-primary text-bg-primary text-[12px] font-bold shadow-sm transition-all">
                1
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-primary bg-bg-secondary text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all active:scale-95 duration-150">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
