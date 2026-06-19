import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  Check,
  Plus,
  Box,
  Upload,
  Package,
  Scan,
  X,
  Info,
  RefreshCw,
  Loader2,
  ChevronDown,
  Image as ImageIcon,
  Lightbulb,
  Zap,
  ArrowUpRight,
  Activity,
  TrendingUp,
  Layers,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageShell from '../layout/PageShell';
import { mockAssets } from '../../data';
import { Asset } from '../../types';
import sessionImage1 from '../../assets/images/regenerated_image_1778648426408.jpg';
import sessionImage2 from '../../assets/images/regenerated_image_1778648971335.webp';
import sessionImage3 from '../../assets/images/regenerated_image_1778586230872.webp';
import draftImage1 from '../../assets/images/regenerated_image_1779428095248.webp';
import draftImage2 from '../../assets/images/regenerated_image_1779428096436.webp';
import techPackImage1 from '../../assets/images/regenerated_image_1778672431063.png';
import recentSessionImage4 from '../../assets/images/regenerated_image_1779781812519.png';

import { convertPdfPageToImage } from '@/src/services/pdfService';
import { useStudioStore } from '../../store/useStudioStore';

import BatchUploadIcon from '../ui/icons/BatchUploadIcon';
import TechPackIngestionModal from '../generator/TechPackIngestionModal';
import { validateTechPackFile, validateTechPackData } from '../../services/fileValidator';

interface MetadataField {
  label: string;
  value: string;
  progress: number;
  status: 'waiting' | 'scanning' | 'complete';
  badge?: string;
}

interface StudioDashboardProps {
  onGenerate?: () => void;
  onAssetClick?: (asset: Asset) => void;
  onTabChange?: (tab: string) => void;
  onReview?: () => void;
  role?: string | null;
  hasNewDraft?: boolean;
}

export default function StudioDashboard({ onGenerate, onAssetClick, onTabChange, onReview, role, hasNewDraft }: StudioDashboardProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionProgress, setIngestionProgress] = useState(0);
  const [ingestedFile, setIngestedFile] = useState<string | null>(null);  
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);  
  const [metadata, setMetadata] = useState<any[]>([]);  

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUploadDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Metadata Extraction States

  const startIngestionSimulation = () => {
    setIngestionProgress(0);

    // Overall progress simulation
    const totalDuration = 5000;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setIngestionProgress(progress);

      // Update individual metadata fields based on progress
      setMetadata(prev => prev.map((f, i) => {
        const fieldThreshold = (i + 1) * 7; // Slightly faster threshold to ensure all finish
        if (progress > fieldThreshold) {
          const fieldProgress = Math.min(((progress - fieldThreshold) / 10) * 100, 100);
          // If overall progress is 100%, force all fields to be complete
          const isComplete = progress >= 100 || fieldProgress >= 95;
          const status = isComplete ? 'complete' : 'scanning';

          return {
            ...f,
            progress: isComplete ? 100 : fieldProgress,
            status,
          };
        }
        return f;
      }));

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  };

  const isCreativeUser = role === 'Creative User';
  let imageUrl = '';
  const handleFileSelect = async (files: FileList | null) => {
    try {
      if (!files || files.length === 0) {
        console.log("StudioDashboard: No files selected.");
        return;
      }

      const file = files[0];
      
      // Perform validation check
      console.log("StudioDashboard: Validating selected file...");
      const validation = await validateTechPackFile(file);
      if (!validation.valid) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: validation.error || 'Invalid file.',
            type: 'error'
          }
        }));
        return;
      }

      console.log(`StudioDashboard: Selected file for ingestion passed validation: ${file.name} (type: ${file.type})`);
      setIngestedFile(file.name);
      setIsIngesting(true);      

      if (file.type === 'application/pdf') {           
        console.log("StudioDashboard: Converting PDF page to image...");
        imageUrl = await convertPdfPageToImage(file);        
      }
      else {        
        console.log("StudioDashboard: Creating object URL for image file...");
        imageUrl = URL.createObjectURL(file);
      }
      setSelectedImage(imageUrl);

      const { handleImageSelect } = useStudioStore.getState();      

      const techPackData = await handleImageSelect(file);            
      if (!techPackData){
        console.error("StudioDashboard: No data extracted from the tech pack.");
        return;
      }      
      console.log("StudioDashboard: Metadata successfully extracted:", techPackData);
      startIngestionSimulation();      

    } catch (error) { 
      console.error("StudioDashboard: Error during file ingestion:", error);
      setIsIngesting(false);
      setIngestedFile(null);
    }
  };    

  const handleIngestionComplete = () => {
    setIsIngesting(false);
    if (onReview) {
      onReview();
    } else if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <PageShell>
      <div 
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsGlobalDragging(true);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="w-full py-8 px-8 relative"
      >
        {/* Welcome Section */}
        <div className="pt-0 mb-8 flex items-start justify-between">
          <div>
            <h1 className="heading-primary leading-tight">
              {isCreativeUser ? 'Hello, Creative User.' : 'Welcome back, Creator.'}
            </h1>
            <p className="mt-1 text-[14px] text-text-secondary font-medium">
              {isCreativeUser ? 'Your AI-assisted creation space is ready.' : 'Your creative studio is ready. What are we building today?'}
            </p>
          </div>
          {isCreativeUser && (
            <div className="flex items-start relative" ref={dropdownRef}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <input
                type="file"
                ref={batchFileInputRef}
                className="hidden"
                multiple
                accept="application/pdf"
                onChange={async (e) => {
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
                    onTabChange?.('batch-detail');
                  }
                }}
              />
              <button
                onClick={() => setIsUploadDropdownOpen(!isUploadDropdownOpen)}
                className="btn-upload active:scale-[0.98] shadow-sm"
              >
                <Box size={13} className="stroke-[2.5]" />
                GET STARTED
                <ChevronDown size={13} className={`transition-transform duration-300 ${isUploadDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUploadDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-full right-0 mt-3 w-64 premium-dropdown z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setIsUploadDropdownOpen(false);
                        setIngestedFile(null);
                        setIsIngesting(true);
                      }}
                      className="premium-dropdown-item uppercase tracking-widest"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white/10 text-white">
                        <Scan size={16} />
                      </div>
                      Upload Techpack
                    </button>
                    <button
                      onClick={() => {
                        setIsUploadDropdownOpen(false);
                        batchFileInputRef.current?.click();
                      }}
                      className="premium-dropdown-item uppercase tracking-widest"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white/10 text-white">
                        <BatchUploadIcon size={16} />
                      </div>
                      Upload Batch
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Generate Bar */}
        {!isCreativeUser && (
          <div className="relative mb-8">
            <div className="flex h-20 items-center gap-4 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-black p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:focus-within:border-white/20 transition-all">
              <div className="flex-1 flex items-center px-6">
                <input
                  type="text"
                  placeholder="Create a high fashion editorial, stark lighting, monolithic brutalist architecture..."
                  className="w-full bg-transparent text-[16px] font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none"
                />
              </div>
              <div className="relative flex items-center">
                <button
                  onClick={() => setIsUploadOpen(!isUploadOpen)}
                  className={`flex h-14 w-14 items-center justify-center rounded-lg transition-all ${isUploadOpen ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/20' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Plus size={24} className={isUploadOpen ? 'rotate-45' : ''} />
                </button>

                <AnimatePresence>
                  {isUploadOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-56 premium-dropdown z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => setIsUploadOpen(false)}
                        className="premium-dropdown-item"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                          <Upload size={16} />
                        </div>
                        Upload Files
                      </button>
                      <button
                        onClick={() => {
                          setIsUploadOpen(false);
                          setIngestedFile(null);
                          setIsIngesting(true);
                        }}
                        className="premium-dropdown-item"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <Package size={16} />
                        </div>
                        UPLOAD TECH PACK
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={onGenerate}
                className="flex items-center gap-3 rounded-lg bg-black dark:bg-white px-8 h-14 text-[13px] font-bold tracking-widest text-white dark:text-black uppercase transition-all hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98] shadow-xl shadow-black/10 dark:shadow-none"
              >
                <Sparkles size={18} className="text-white dark:text-black" />
                Generate Asset
              </button>
            </div>
          </div>
        )}

        {/* Creative User Metrics */}
        {isCreativeUser && (
          <div className="mb-8 grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: 'UPLOADS DETECTED', value: '142', change: '+12%', icon: Box, trend: 'up' },
              { label: 'REFINEMENTS', value: '186', change: '+24%', icon: Activity, trend: 'up' },
              { label: 'DRAFTS SAVED', value: '24', change: '+4', icon: Layers, trend: 'up' },
              { label: 'SUCCESS RATE', value: '92%', change: '+2.1%', icon: TrendingUp, trend: 'up' },
              { label: 'ACTIVE PROCESS', value: '8', change: '+2', icon: Clock, trend: 'up' },
              { label: 'AVG TIME', value: '1.2s', change: '-0.3s', icon: Zap, trend: 'down' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="premium-card h-[128px] p-5 flex flex-col justify-between cursor-default">
                  <div className="flex items-start justify-between">
                    <div className="text-text-tertiary">
                      <Icon size={16} strokeWidth={1.8} />
                    </div>
                    <div className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100/50 dark:border-emerald-500/20">
                      <ArrowUpRight size={10} className="stroke-[2.5] mr-0.5" />
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-text-tertiary uppercase mb-0.5 truncate">{stat.label}</div>
                    <div className="text-[28px] font-bold tracking-[-0.03em] text-text-primary leading-none">{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="col-span-12 lg:col-span-8 space-y-8">

            {/* Recent Sessions */}
            <section>
              <div className="mb-8 flex items-center justify-between">
                <h3 className="heading-section">Recent Sessions</h3>
                <button
                  onClick={() => onTabChange?.('recent')}
                  className="text-[12px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-premium uppercase tracking-[0.2em]"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* Session Card 1 */}
                <div
                  className="group cursor-pointer bg-bg-secondary p-3 rounded-2xl border border-border-primary shadow-sm dark:shadow-none hover:border-text-secondary/40 transition-premium"
                  onClick={() => onAssetClick?.(mockAssets[3])}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[12px] bg-slate-900 dark:bg-white/5 mb-4">
                    <img
                      src={(sessionImage2 as any)?.src || sessionImage2}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-[6px] text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] shadow-sm z-10">
                      DRAFT
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                      <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase opacity-80">S_101.RAW</span>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white"> 59FIFTY THE ORIGINAL-Arizona Diamondbacks</p>
                  <p className="text-[11px] text-slate-400 font-medium">12 variations</p>
                </div>

                <div
                  className="group cursor-pointer bg-bg-secondary p-3 rounded-2xl border border-border-primary shadow-sm dark:shadow-none hover:border-text-secondary/40 transition-premium"
                  onClick={() => onAssetClick?.(mockAssets[0])}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[12px] bg-slate-900 dark:bg-white/5 mb-4">
                    <img
                      src={(sessionImage1 as any)?.src || sessionImage1}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-[6px] text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] shadow-sm z-10">
                      DRAFT
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                      <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase opacity-80">S_102.RAW</span>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">Classic 59FIFTY - Red</p>
                  <p className="text-[11px] text-slate-400 font-medium">8 variations</p>
                </div>



                {/* Session Card 3 */}
                <div
                  className="group cursor-pointer bg-bg-secondary p-3 rounded-2xl border border-border-primary shadow-sm dark:shadow-none hover:border-text-secondary/40 transition-premium"
                  onClick={() => onAssetClick?.(mockAssets[4])}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[12px] bg-slate-900 dark:bg-white/5 mb-4">
                    <img
                      src={(sessionImage3 as any)?.src || sessionImage3}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 bg-emerald-50/90 dark:bg-emerald-500/10 backdrop-blur-sm px-2 py-1 rounded-[6px] text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.1em] shadow-sm z-10">
                      APPROVED
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                      <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase opacity-80">S_100.RAW</span>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">Team Edition Black</p>
                  <p className="text-[11px] text-slate-400 font-medium">4 variations</p>
                </div>

                {/* Session Card 4 */}
                <div
                  className="group cursor-pointer bg-bg-secondary p-3 rounded-2xl border border-border-primary shadow-sm dark:shadow-none hover:border-text-secondary/40 transition-premium"
                  onClick={() => onAssetClick?.(mockAssets[9])}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[12px] bg-slate-900 dark:bg-white/5 mb-4">
                    <img
                      src={(recentSessionImage4 as any)?.src || recentSessionImage4}
                      className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-[6px] text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] shadow-sm z-10">
                      DRAFT
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                      <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase opacity-80">S_103.RAW</span>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">Vintage 9FORTY Adj.</p>
                  <p className="text-[11px] text-slate-400 font-medium">6 variations</p>
                </div>
              </div>
            </section>

            {/* Draft Generations */}
            <section className="premium-card">
              <div className="mb-10 flex items-center justify-between">
                <h3 className="heading-section">Draft Generations</h3>
                <button
                  onClick={() => onTabChange?.('gallery')}
                  className="text-[12px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-premium uppercase tracking-[0.2em]"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {hasNewDraft && (
                  <div
                    className="premium-card p-3 flex flex-col cursor-pointer transition-premium animate-in fade-in slide-in-from-left-4"
                    onClick={onReview}
                  >
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-50 dark:bg-white/5 border border-border-primary/50 mb-3 overflow-hidden">
                      <img
                        src={(sessionImage2 as any)?.src || sessionImage2}
                        alt="New Draft"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
                      />
                      <div className="absolute top-2 right-2 bg-bg-secondary/80 backdrop-blur border border-border-primary px-2 py-0.5 rounded text-[9px] font-bold text-text-secondary uppercase tracking-wider shadow-sm">
                        Draft
                      </div>
                    </div>
                    <div className="px-1 py-1 mt-auto flex items-center justify-between">
                      <p className="text-xs font-bold text-text-primary truncate pr-2">Arizona Diamondbacks</p>
                      <p className="text-[10px] font-mono text-text-tertiary font-semibold shrink-0">@v7.0</p>
                    </div>
                  </div>
                )}
                <div
                  className="premium-card p-3 flex flex-col cursor-pointer transition-premium"
                  onClick={onReview}
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-50 dark:bg-white/5 border border-border-primary/50 mb-3 overflow-hidden">
                    <img
                      src={(draftImage1 as any)?.src || draftImage1}
                      alt="Draft 1"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
                    />
                    <div className="absolute top-2 right-2 bg-bg-secondary/80 backdrop-blur border border-border-primary px-2 py-0.5 rounded text-[9px] font-bold text-text-secondary uppercase tracking-wider shadow-sm">
                      Draft
                    </div>
                  </div>
                  <div className="px-1 py-1 mt-auto flex items-center justify-between">
                    <p className="text-xs font-bold text-text-primary truncate pr-2">Cyberpunk Streetscape</p>
                    <p className="text-[10px] font-mono text-text-tertiary font-semibold shrink-0">@v6.0</p>
                  </div>
                </div>

                <div
                  className="premium-card p-3 flex flex-col cursor-pointer transition-premium"
                  onClick={onReview}
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-50 dark:bg-white/5 border border-border-primary/50 mb-3 overflow-hidden">
                    <img
                      src={(draftImage2 as any)?.src || draftImage2}
                      alt="Draft 2"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
                    />
                    <div className="absolute top-2 right-2 bg-bg-secondary/80 backdrop-blur border border-border-primary px-2 py-0.5 rounded text-[9px] font-bold text-text-secondary uppercase tracking-wider shadow-sm">
                      Draft
                    </div>
                  </div>
                  <div className="px-1 py-1 mt-auto flex items-center justify-between">
                    <p className="text-xs font-bold text-text-primary truncate pr-2">Minimalist Watch Study</p>
                    <p className="text-[10px] font-mono text-text-tertiary font-semibold shrink-0">@v5.2</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="col-span-12 lg:col-span-4 space-y-8">

            {/* Pending Review */}
            <div className="premium-card">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="heading-section">Pending Review</h3>
                <button
                  onClick={() => onTabChange?.('pending-reviews')}
                  className="text-[12px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-premium uppercase tracking-[0.2em]"
                >
                  View All
                </button>
              </div>
              <div className="space-y-6">
                <div
                  className="group flex items-center justify-between cursor-pointer"
                  onClick={() => onAssetClick?.(mockAssets[8])}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <img src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=400" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] transition-colors">Classic 59FIFTY Fitted</p>
                      <p className="text-[12px] text-text-secondary font-medium">Requires upscaling</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-all" />
                </div>

                <div
                  className="group flex items-center justify-between cursor-pointer"
                  onClick={() => onAssetClick?.(mockAssets[8])}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <img src="https://images.unsplash.com/photo-1576870005716-e41b9ef2567f?auto=format&fit=crop&q=80&w=400" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] transition-colors">Vintage 9FORTY Adjustable</p>
                      <p className="text-[12px] text-text-secondary font-medium">Review 24 generations</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-all" />
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="premium-card">
              <div className="mb-8 flex items-center gap-3">
                <span className="text-[#E11D48]">
                  <Lightbulb size={24} />
                </span>
                <h3 className="heading-section">AI Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 rounded-xl bg-[#F0FDF4] dark:bg-emerald-500/10 p-5 border border-[#DCFCE7] dark:border-emerald-500/20">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    Your recent prompts are yielding high-confidence results (94% aesthetic match).
                  </p>
                </div>
                <div className="flex gap-4 rounded-xl bg-[#FFF7ED] dark:bg-amber-500/10 p-5 border border-[#FFEDD5] dark:border-amber-500/20">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    Refining your recent drafts has improved model inference accuracy on product angles by 18%.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

        {/* Global drag-and-drop overlay */}
        <AnimatePresence>
          {isGlobalDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragLeave={() => setIsGlobalDragging(false)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleGlobalDrop}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md border-4 border-dashed border-slate-700 dark:border-white/20 m-4 rounded-3xl"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="flex flex-col items-center max-w-md text-center pointer-events-none"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 dark:bg-white/5 text-white mb-6 border-2 border-white/20 shadow-lg shadow-black/15 animate-pulse">
                  <Upload size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Drop Tech Pack Anywhere</h2>
                <p className="text-[14px] text-slate-300 dark:text-slate-400 leading-relaxed font-semibold">
                  Drop your technical schematic file to automatically parse, scan, and map design parameters.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-8 font-mono font-bold uppercase tracking-widest">
                  Ready for AI extraction
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Tech Pack Ingestion Overlay */}
      <TechPackIngestionModal
        isOpen={isIngesting}
        onClose={() => {
          setIsIngesting(false);
          setIngestedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          if (batchFileInputRef.current) batchFileInputRef.current.value = '';
        }}
        fileName={ingestedFile}
        onComplete={handleIngestionComplete}
        imageSrc={(techPackImage1 as any)?.src || techPackImage1}
      />
    </PageShell>
  );
}
