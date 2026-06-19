import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Zap,
  Info,
  X,
  MoreHorizontal,
  ChevronRight,
  Package,
  Search,
  Scan,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { recentUploads as centralizedUploads, images } from '../../data';
import TechPackIngestionModal from './TechPackIngestionModal';
import { validateTechPackFile, validateTechPackData } from '../../services/fileValidator';
import { useStudioStore } from '../../store/useStudioStore';

interface UploadCenterProps {
  onGenerate: (prompt: string) => void;
  onReview?: () => void;
}

interface MetadataField {
  label: string;
  value: string;
  progress: number;
  status: 'waiting' | 'scanning' | 'complete';
  badge?: string;
}

export default function UploadCenter({ onGenerate, onReview }: UploadCenterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<any[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionProgress, setIngestionProgress] = useState(0);
  const [ingestedFile, setIngestedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadata Extraction States
  const [metadata, setMetadata] = useState<MetadataField[]>([
    { label: 'Style code', value: '--', progress: 0, status: 'waiting' },
    { label: 'Fabric', value: '--', progress: 0, status: 'waiting' },
    { label: 'Undercolor', value: '--', progress: 0, status: 'waiting' },
    { label: 'Sweatband', value: '--', progress: 0, status: 'waiting' },
    { label: 'Series', value: '--', progress: 0, status: 'waiting' },
    { label: 'Front Logo Treatment', value: '--', progress: 0, status: 'waiting' },
    { label: 'Front Logo Placement', value: '--', progress: 0, status: 'waiting' },
    { label: 'Embroidery Colors', value: '--', progress: 0, status: 'waiting' },
    { label: 'PMS Colors', value: '--', progress: 0, status: 'waiting' },
    { label: 'Rear Logo placement', value: '--', progress: 0, status: 'waiting' },
    { label: 'Left Logo placement', value: '--', progress: 0, status: 'waiting' },
  ]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = await validateTechPackFile(file);
      if (!validation.valid) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: `File "${file.name}" is invalid: ${validation.error || 'Invalid file.'}`,
            type: 'error'
          }
        }));
        return;
      }
    }

    const file = files[0];
    setIngestedFile(file.name);
    setIsIngesting(true);
    const { handleImageSelect } = useStudioStore.getState();
    await handleImageSelect(file);
  };

  const startIngestionSimulation = () => {
    setIngestionProgress(0);
    // Reset metadata
    setMetadata([
      { label: 'Style code', value: 'NE-V4-5950', progress: 0, status: 'scanning', badge: '59FIFTY' },
      { label: 'Fabric', value: 'POLYESTER', progress: 0, status: 'waiting', badge: 'POLYESTER' },
      { label: 'Undercolor', value: 'GREY', progress: 0, status: 'waiting', badge: 'GREY' },
      { label: 'Sweatband', value: 'BLACK', progress: 0, status: 'waiting', badge: 'BLACK' },
      { label: 'Series', value: '59FIFTY THE ORIGINAL', progress: 0, status: 'waiting' },
      { label: 'Front Logo Treatment', value: 'Direct Embroidery', progress: 0, status: 'waiting' },
      { label: 'Front Logo Placement', value: 'Centered on Front Panels', progress: 0, status: 'waiting' },
      { label: 'Embroidery Colors', value: 'H Red M1638, Black, Green', progress: 0, status: 'waiting' },
      { label: 'PMS Colors', value: '187, BLACK, 319', progress: 0, status: 'waiting' },
      { label: 'Rear Logo placement', value: 'Centered on Rear Panels', progress: 0, status: 'waiting' },
      { label: 'Left Logo placement', value: 'Direct Embroidery', progress: 0, status: 'waiting' },
    ]);

    // Overall progress simulation
    const totalDuration = 5000;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setIngestionProgress(progress);

      // Update individual metadata fields based on progress
      setMetadata(prev => prev.map((f, i) => {
        const fieldThreshold = (i + 1) * 8;
        if (progress > fieldThreshold) {
          const fieldProgress = Math.min(((progress - fieldThreshold) / 15) * 100, 100);
          const isComplete = fieldProgress >= 95;
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

  const handleIngestionComplete = () => {
    setIsIngesting(false);
    
    // Notify parent to transition to review screen
    if (onReview) {
      onReview();
    }

    const mockReadyFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: ingestedFile,
      status: 'ready',
      progress: 100,
      detectedPrompt: `Photorealistic 59FIFTY fitted cap, silhouette: 59FIFTY, material: Wool Blend, style: NE-9921-X, colorway: Deep Navy crown.`
    };
    setUploads(prev => [mockReadyFile, ...prev]);
  };

  const recentUploads = centralizedUploads;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black pl-16 peer-hover:pl-48 pt-16 transition-all duration-300">
      <div className="w-full py-12 px-[48px]">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">Upload Center</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium font-sans">Securely upload your tech packs to extract metadata and prepare generation prompts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-8">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-slate-800 bg-slate-50/80 dark:border-white/40 dark:bg-white/5 shadow-md' 
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-white/[0.07]'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 dark:bg-white/5 text-slate-400 mb-6 border border-slate-100 dark:border-white/10 group-hover:bg-white dark:group-hover:bg-white/10 transition-all shadow-sm">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Drop Tech Packs Here</h3>
                <p className="text-sm text-slate-400 text-center max-w-[280px] leading-relaxed font-medium">
                  Drag and drop PDF files. Maximum file size: <span className="text-slate-900 dark:text-white">50MB</span>
                </p>
              </div>

              {/* Upload Queue */}
              <AnimatePresence>
                {uploads.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Processing Queue</h3>
                      <button 
                        onClick={() => setUploads([])}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    {uploads.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400">
                              <FileText size={20} />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">{item.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {item.status === 'analyzing' ? (
                                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                    <Clock size={12} className="animate-spin" /> Analyzing...
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                    <CheckCircle2 size={12} /> Tech Pack Detected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {item.status === 'ready' && (
                            <button 
                              onClick={() => onGenerate(item.detectedPrompt)}
                              className="flex items-center gap-2 rounded-lg bg-black dark:bg-white px-4 py-2.5 text-[12px] font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg shadow-black/5"
                            >
                              Generate
                              <ArrowRight size={14} />
                            </button>
                          )}
                        </div>

                        {item.status === 'ready' && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 flex items-start gap-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/10 p-4 border border-emerald-100/50 dark:border-emerald-500/20"
                          >
                            <Zap size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-[13px] text-slate-600 dark:text-slate-400 font-mono leading-relaxed truncate">
                              {item.detectedPrompt}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Recent Uploads Grid */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-[18px] font-bold text-slate-900 dark:text-white">Recent Uploads</h3>
                  <span className="rounded-[4px] bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    {recentUploads.length} TOTAL
                  </span>
                </div>
                <button className="flex items-center gap-1 text-[12px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group">
                  View All History
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentUploads.map((upload) => (
                  <motion.div 
                    key={upload.id}
                    whileHover={{ y: -4 }}
                    className="group flex flex-col rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer"
                  >
                    {/* Card Preview */}
                    <div className="relative aspect-square bg-slate-50 dark:bg-white/5 border-b border-slate-50 dark:border-white/5 flex items-center justify-center overflow-hidden">
                      {upload.preview ? (
                        <img src={(upload.preview as any)?.src || upload.preview} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 dark:opacity-60" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-200 dark:text-slate-800">
                          <FileText size={32} strokeWidth={1} />
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700">No Preview</span>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold tracking-widest ${
                          upload.status === 'READY' ? 'bg-emerald-500/10 text-emerald-600' :
                          upload.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                        }`}>
                          {upload.status}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Card Body */}
                    <div className="p-3">
                      <h4 className="text-[12px] font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{upload.name}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <span>{upload.size}</span>
                          <div className="h-0.5 w-0.5 rounded-full bg-slate-200 dark:bg-white/10" />
                          <span>{upload.time}</span>
                        </div>
                        <button className="text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-[#F1F5F9]/30 dark:bg-white/5 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/10 mb-6 text-slate-800 dark:text-slate-200">
                <Info size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Submission Guide</h3>
              <ul className="space-y-4">
                {[
                  'Ensure high-resolution images',
                  'Include clear color specifications',
                  'Detail embroidery requirements',
                  'Specify fabric textures clearly'
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white dark:bg-white/10 text-[10px] font-bold text-slate-400 border border-slate-100 dark:border-white/10">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-900 dark:bg-white p-8 text-white dark:text-black">
              <Sparkles className="text-slate-700 dark:text-slate-300 mb-6" size={32} />
              <h3 className="text-lg font-bold mb-4">AI Detection Active</h3>
              <p className="text-[13px] text-white/60 dark:text-black/60 leading-relaxed font-medium mb-6">
                Our neural network automatically parses patterns, materials, and silhouettes from your technical drawings to construct optimized prompt lineages.
              </p>
              <div className="flex h-2 w-full bg-white/10 dark:bg-black/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-slate-900 dark:bg-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Pack Ingestion Overlay */}
      <TechPackIngestionModal
        isOpen={isIngesting}
        onClose={() => {
          setIsIngesting(false);
          setIngestedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        fileName={ingestedFile}
        onComplete={handleIngestionComplete}
        imageSrc={images.techPackImage}
      />
    </div>
  );
}
