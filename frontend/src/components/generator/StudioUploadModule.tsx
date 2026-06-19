import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Scan,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Package,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Box,
  ChevronRight,
  ChevronDown,
  X,
  RefreshCw,
  Loader2,
  Zap,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  LayoutGrid,
  List,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import techPackImage1 from '../../assets/images/regenerated_image_1778672431063.png';
import PageShell from '../layout/PageShell';
import { useStudioStore } from '../../store/useStudioStore';

interface MetadataField {
  label: string;
  value: string;
  progress: number;
  status: 'waiting' | 'scanning' | 'complete';
  badge?: string;
}

import BatchUploadIcon from '../ui/icons/BatchUploadIcon';
import TechPackIngestionModal from './TechPackIngestionModal';
import StatusBadge from '../ui/StatusBadge';
import { validateTechPackFile, validateTechPackData } from '../../services/fileValidator';

const studioUploads = [
  { id: 'S-2026-002', name: 'Classic 59FIFTY Red', category: 'NY Yankees', added: 'May 24 2026', status: 'Approved', statusColor: 'bg-emerald-50 text-emerald-600', confidence: '98.5%', confidenceColor: 'text-emerald-500', file: 'nyy_home_classic.pdf' },
  { id: 'S-2026-001', name: '59FIFTY THE ORIGINAL', category: 'Arizona Diamondbacks', added: 'May 24 2026', status: 'Processed', statusColor: 'bg-emerald-50 text-emerald-600', confidence: '99.8%', confidenceColor: 'text-emerald-500', file: 'techpack_dbacks_v2.pdf' },
  { id: 'S-2026-003', name: 'Team Edition Black', category: 'Chicago Bulls', added: 'May 23 2026', status: 'In Review', statusColor: 'bg-blue-50 text-blue-600', confidence: '97.2%', confidenceColor: 'text-slate-500', file: 'bulls_black_limited.pdf' },
  { id: 'S-2026-004', name: 'Vintage 9FORTY Adj', category: 'Generic Sport', added: 'May 23 2026', status: 'Draft', statusColor: 'bg-rose-50 text-rose-600', confidence: '--', confidenceColor: 'text-slate-500', file: '9forty_vintage_ref.png' },
  { id: 'S-2026-005', name: '39THIRTY Mesh Back', category: 'LA Dodgers', added: 'May 22 2026', status: 'Draft', statusColor: 'bg-rose-50 text-rose-600', confidence: '42%', confidenceColor: 'text-slate-500', file: 'dodgers_mesh_error.pdf' },
  { id: 'S-2026-006', name: 'Retro Cooperstown Cap', category: 'LA Dodgers', added: 'May 22 2026', status: 'Approved', statusColor: 'bg-emerald-50 text-emerald-600', confidence: '96.4%', confidenceColor: 'text-emerald-500', file: 'dodgers_retro_cooperstown.pdf' },
  { id: 'S-2026-007', name: 'Gold Edition 59FIFTY', category: 'Chicago Bulls', added: 'May 21 2026', status: 'Processed', statusColor: 'bg-emerald-50 text-emerald-600', confidence: '99.1%', confidenceColor: 'text-emerald-500', file: 'bulls_gold_lux.pdf' },
  { id: 'S-2026-008', name: 'Training Stretch Fit', category: 'Arizona Diamondbacks', added: 'May 21 2026', status: 'In Review', statusColor: 'bg-blue-50 text-blue-600', confidence: '94.2%', confidenceColor: 'text-slate-500', file: 'dbacks_training_stretch.pdf' },
  { id: 'S-2026-009', name: 'Camo Crown Adjustable', category: 'Generic Sport', added: 'May 20 2026', status: 'Draft', statusColor: 'bg-rose-50 text-rose-600', confidence: '--', confidenceColor: 'text-slate-500', file: 'generic_camo_crown.png' },
  { id: 'S-2026-010', name: 'Memorial Day Special', category: 'NY Yankees', added: 'May 20 2026', status: 'Approved', statusColor: 'bg-emerald-50 text-emerald-600', confidence: '98.9%', confidenceColor: 'text-emerald-500', file: 'nyy_memorial_day_spec.pdf' },
];

export default function StudioUploadModule({ onReview, onAssetClick }: { onReview?: () => void, onAssetClick?: (asset: any) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Dynamic pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const rowsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(event.target as Node)) {
        setIsRowsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset to first page when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const [sortField, setSortField] = useState<string>('added');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedUploads = useMemo(() => {
    let result = [...studioUploads];

    // 1. Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (upload) =>
          upload.name.toLowerCase().includes(q) ||
          upload.id.toLowerCase().includes(q) ||
          upload.category.toLowerCase().includes(q) ||
          upload.file.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(upload => upload.category === selectedCategory);
    }

    // 3. Status filter
    if (selectedStatus !== 'All') {
      result = result.filter(upload => upload.status === selectedStatus);
    }

    // 4. Sort
    result.sort((a: any, b: any) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle confidence percentage sorting
      if (sortField === 'confidence') {
        aVal = parseFloat(a.confidence.replace('%', '')) || 0;
        bVal = parseFloat(b.confidence.replace('%', '')) || 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [searchQuery, sortField, sortDirection, selectedCategory, selectedStatus]);

  const paginatedUploads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedUploads.slice(startIndex, startIndex + itemsPerPage);
  }, [processedUploads, currentPage, itemsPerPage]);

  const renderHeader = (label: string, field: string) => {
    const isActive = sortField === field;
    return (
      <th
        className="px-6 py-3 text-[12px] font-semibold text-[#667085] dark:text-[#667085] uppercase tracking-[0.08em] cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-[#131922] transition-premium group"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1.5 select-none">
          <span>{label}</span>
          <div className="flex items-center w-3">
            {isActive ? (
              sortDirection === 'desc' ? (
                <ArrowDown size={11} className="transition-premium stroke-[2.5] text-text-primary" />
              ) : (
                <ArrowUp size={11} className="transition-premium stroke-[2.5] text-text-primary" />
              )
            ) : (
              <ArrowUp size={11} className="transition-premium stroke-[2.5] text-text-tertiary opacity-0 group-hover:opacity-40" />
            )}
          </div>
        </div>
      </th>
    );
  };

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionProgress, setIngestionProgress] = useState(0);
  const [ingestedFile, setIngestedFile] = useState<string | null>(null);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  const handleGlobalDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
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
      setIngestedFile(file.name);
      setIsIngesting(true);
      const { handleImageSelect } = useStudioStore.getState();
      await handleImageSelect(file);
    }
  };
  const [metadata, setMetadata] = useState<MetadataField[]>([
    { label: 'Style Code', value: '59FIFTY THE ORIGINAL', progress: 100, status: 'complete' },
    { label: 'Fabric', value: 'POLYESTER', progress: 100, status: 'complete' },
    { label: 'Undercolor', value: 'GREY', progress: 100, status: 'complete' },
    { label: 'PMS Colors', value: '319, 187, BLACK', progress: 100, status: 'complete' },
    { label: 'Sweatband', value: 'BLACK', progress: 100, status: 'complete' },
    { label: 'Series', value: 'Arizona Diamondback...', progress: 100, status: 'complete' },
    { label: 'Front Logo Treatment', value: 'DIRECT EMBROIDERY', progress: 100, status: 'complete' },
    { label: 'Front Logo Placement', value: 'CENTERED', progress: 100, status: 'complete' },
    { label: 'Rear Logo Placement', value: 'CENTERED', progress: 100, status: 'complete' },
    { label: 'Left Logo Treatment', value: 'DIRECT EMBROIDERY', progress: 100, status: 'complete' },
    { label: 'Embroidery Colors', value: 'H Red M1638, Real Black 5596, Calypso Green 1846', progress: 100, status: 'complete' },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const handleViewClick = (upload: any) => {
    if (upload.status === 'Processed' || upload.status === 'Approved') {
      if (onAssetClick) {
        onAssetClick({
          id: upload.id,
          title: upload.name,
          imageUrl: typeof techPackImage1 === 'object' && techPackImage1 !== null && 'src' in techPackImage1 ? (techPackImage1 as any).src : techPackImage1,
          status: upload.status,
          category: upload.category,
          tags: [],
          refId: upload.id,
          createdAt: upload.added,
        });
      }
    } else if (upload.status === 'In Review' || upload.status === 'Draft') {
      if (onReview) {
        onReview();
      }
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
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

    setIngestedFile(file.name);
    setIsIngesting(true);
    const { handleImageSelect } = useStudioStore.getState();
    await handleImageSelect(file);
  };

  const startIngestionSimulation = () => {
    setIngestionProgress(0);
    setMetadata([
      { label: 'Style Code', value: '59FIFTY THE ORIGINAL', progress: 0, status: 'waiting' },
      { label: 'Fabric', value: 'POLYESTER', progress: 0, status: 'waiting' },
      { label: 'Undercolor', value: 'GREY', progress: 0, status: 'waiting' },
      { label: 'PMS Colors', value: '319, 187, BLACK', progress: 0, status: 'waiting' },
      { label: 'Sweatband', value: 'BLACK', progress: 0, status: 'waiting' },
      { label: 'Series', value: 'Arizona Diamondback...', progress: 0, status: 'waiting' },
      { label: 'Front Logo Treatment', value: 'DIRECT EMBROIDERY', progress: 0, status: 'waiting' },
      { label: 'Front Logo Placement', value: 'CENTERED', progress: 0, status: 'waiting' },
      { label: 'Rear Logo Placement', value: 'CENTERED', progress: 0, status: 'waiting' },
      { label: 'Left Logo Treatment', value: 'DIRECT EMBROIDERY', progress: 0, status: 'waiting' },
      { label: 'Embroidery Colors', value: 'H Red M1638, Real Black 5596, Calypso Green 1846', progress: 0, status: 'waiting' },
    ]);

    const totalDuration = 5000;
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setIngestionProgress(progress);

      setMetadata(prev => prev.map((f, i) => {
        const fieldThreshold = (i + 1) * 7;
        if (progress > fieldThreshold) {
          const fieldProgress = Math.min(((progress - fieldThreshold) / 10) * 100, 100);
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

  const handleIngestionComplete = () => {
    setIsIngesting(false);
    if (onReview) {
      onReview();
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
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="heading-primary leading-tight">Studio</h1>
            <p className="text-[14px] text-text-secondary font-medium mt-1">Manage individual techpack ingestions and AI extraction results.</p>
          </div>

          <div className="relative flex items-center">
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
                  if (onReview) {
                    onReview();
                  }
                }
              }}
            />

            <button
              onClick={() => {
                setIngestedFile(null);
                setIsIngesting(true);
              }}
              className="btn-upload active:scale-95 shadow-sm"
            >
              <Box size={13} className="stroke-[2.5]" />
              Upload Techpack
            </button>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'TOTAL FILES PROCESSING', value: '142', change: '+12 this week', icon: <Package />, trend: 'up' },
            { label: 'PENDING REVIEW', value: '12', change: 'Requires Action', icon: <Clock />, trend: 'neutral' },
            { label: 'PROCESSED', value: '118', change: '99.8% confidence', icon: <Zap />, trend: 'up' },
            { label: 'APPROVED', value: '96', change: 'Ready for downstream', icon: <CheckCircle2 />, trend: 'up' },
          ].map((metric, i) => (
            <div
              key={i}
              className="premium-card h-[128px] p-5 flex flex-col justify-between cursor-default"
            >
              <div className="flex items-start justify-between">
                <p className="text-[12px] font-semibold text-text-tertiary uppercase tracking-[0.04em]">{metric.label}</p>
                <div className="text-text-tertiary group-hover:text-text-secondary transition-colors duration-200">
                  {React.cloneElement(metric.icon as React.ReactElement<any>, { size: 16, className: 'stroke-[1.8]' })}
                </div>
              </div>

              <div className="flex items-baseline gap-2.5">
                <h3 className="text-[36px] font-bold text-text-primary leading-none tracking-[-0.03em]">{metric.value}</h3>
              </div>

              <div className="flex items-center gap-1.5">
                {metric.trend === 'up' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20">
                    <ArrowUpRight size={10} className="stroke-[2.5] mr-0.5" />
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

        {/* Uploads Table */}
        <div className="bg-bg-table w-full border border-border-primary shadow-sm rounded-xl">
          {/* Toolbar */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-between border-b border-border-primary bg-bg-tertiary gap-4 rounded-t-xl">
            <h2 className="heading-section">Recent Sessions</h2>
            <div className="flex items-center gap-4">
              <div className="relative w-full md:w-[240px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 h-[42px] border border-border-primary rounded-lg text-[13px] text-text-primary bg-white dark:bg-[#0D1117] placeholder:text-text-tertiary focus:outline-none focus:border-transparent focus:shadow-[0_0_0_2px_rgba(15,23,42,.08)] dark:focus:shadow-[0_0_0_2px_rgba(255,255,255,.08)] transition-all duration-200"
                />
              </div>
              <span className="text-[13px] font-semibold text-text-secondary whitespace-nowrap">Filter By:</span>

              {/* Category Dropdown */}
              <div ref={categoryRef} className="relative">
                <button
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 border h-[42px] px-4 rounded-lg text-[13px] text-text-secondary font-semibold whitespace-nowrap bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated focus:outline-none focus:border-transparent focus:shadow-[0_0_0_2px_rgba(15,23,42,.08)] dark:focus:shadow-[0_0_0_2px_rgba(255,255,255,.08)] transition-all duration-200 ${
                    isCategoryDropdownOpen
                      ? 'border-transparent shadow-[0_0_0_2px_rgba(15,23,42,.08)] dark:shadow-[0_0_0_2px_rgba(255,255,255,.08)]'
                      : 'border-border-primary'
                  }`}
                >
                  <Box size={13} className="text-text-tertiary" />
                  Category: {selectedCategory}
                  <ChevronDown size={13} className="text-text-tertiary" />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-[rgba(255,255,255,.88)] dark:bg-[rgba(15,23,42,.92)] backdrop-blur-[20px] border border-border-primary rounded-xl shadow-xl z-[60] py-1 font-sans">
                    {['All', 'NY Yankees', 'Arizona Diamondbacks', 'Chicago Bulls', 'Generic Sport', 'LA Dodgers'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] transition-all duration-150 ${selectedCategory === cat
                          ? 'bg-neutral-100 dark:bg-bg-elevated text-text-primary font-bold'
                          : 'text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated/50 font-semibold'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div ref={statusRef} className="relative">
                <button
                  onClick={() => {
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 border h-[42px] px-4 rounded-lg text-[13px] text-text-secondary font-semibold whitespace-nowrap bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated focus:outline-none focus:border-transparent focus:shadow-[0_0_0_2px_rgba(15,23,42,.08)] dark:focus:shadow-[0_0_0_2px_rgba(255,255,255,.08)] transition-all duration-200 ${
                    isStatusDropdownOpen
                      ? 'border-transparent shadow-[0_0_0_2px_rgba(15,23,42,.08)] dark:shadow-[0_0_0_2px_rgba(255,255,255,.08)]'
                      : 'border-border-primary'
                  }`}
                >
                  <Activity size={13} className="text-text-tertiary" />
                  Status: {selectedStatus}
                  <ChevronDown size={12} className="text-text-tertiary" />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-[rgba(255,255,255,.88)] dark:bg-[rgba(15,23,42,.92)] backdrop-blur-[20px] border border-border-primary rounded-xl shadow-xl z-[60] py-1 font-sans">
                    {['All', 'Approved', 'Processed', 'In Review', 'Draft'].map((stat) => (
                      <button
                        key={stat}
                        onClick={() => {
                          setSelectedStatus(stat);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] transition-all duration-150 ${selectedStatus === stat
                          ? 'bg-neutral-100 dark:bg-bg-elevated text-text-primary font-bold'
                          : 'text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated/50 font-semibold'
                          }`}
                      >
                        {stat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                    {renderHeader('FILE & ORIGIN', 'name')}
                    {renderHeader('ID', 'id')}
                    {renderHeader('CATEGORY', 'category')}
                    {renderHeader('CONFIDENCE', 'confidence')}
                    {renderHeader('STATUS', 'status')}
                    {renderHeader('ADDED', 'added')}
                    <th className="px-6 py-3 text-[12px] font-semibold text-[#667085] dark:text-[#667085] text-right uppercase tracking-[0.08em] whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary border-b border-border-primary">
                  {paginatedUploads.map((upload) => (
                    <tr
                      key={upload.id}
                      className="group table-row-hover transition-premium h-[76px] border-b border-border-primary"
                    >
                      <td className="px-6 py-0">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden bg-bg-tertiary border border-border-primary flex items-center justify-center">
                            <img
                              src={typeof techPackImage1 === 'object' && techPackImage1 !== null && 'src' in techPackImage1 ? (techPackImage1 as any).src : techPackImage1}
                              alt={upload.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-semibold text-text-primary leading-tight">{upload.name}</span>
                            <span className="text-[13px] font-medium text-text-tertiary mt-1 leading-none">{upload.file}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-0 text-[14px] text-text-secondary font-medium">
                        {upload.id}
                      </td>
                      <td className="px-6 py-0 text-[14px] text-text-secondary font-medium">
                        {upload.category}
                      </td>
                      <td className="px-6 py-0 text-[14px] font-medium">
                        <span className={upload.confidenceColor}>{upload.confidence}</span>
                      </td>
                      <td className="px-6 py-0 font-normal">
                        <StatusBadge status={upload.status} />
                      </td>
                      <td className="px-6 py-0 text-[14px] text-text-secondary font-medium whitespace-nowrap">
                        {upload.added}
                      </td>
                      <td className="px-6 py-0">
                        <div className="flex items-center justify-end gap-1.5 text-text-tertiary">
                          <button
                            onClick={() => handleViewClick(upload)}
                            className="p-1.5 border border-border-primary rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-[#2563EB] hover:border-blue-200 dark:hover:border-blue-500/20 transition-premium active:scale-95"
                          >
                            <Eye size={13} className="stroke-[1.8]" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 border border-border-primary text-text-secondary rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-500/20 transition-premium active:scale-95"
                          >
                            <Trash2 size={13} className="stroke-[1.8]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-bg-tertiary/20 border-b border-border-primary">
                {paginatedUploads.map((upload) => (
                  <div
                    key={upload.id}
                    onClick={() => handleViewClick(upload)}
                    className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden hover:border-text-secondary/30 transition-all duration-300 group flex flex-col h-full relative cursor-pointer active:scale-[0.99]"
                  >
                    <div className="w-full relative bg-bg-tertiary overflow-hidden flex-shrink-0" style={{ paddingBottom: '70%' }}>
                      <img
                        src={typeof techPackImage1 === 'object' && techPackImage1 !== null && 'src' in techPackImage1 ? (techPackImage1 as any).src : techPackImage1}
                        alt={upload.name}
                        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
                      />
                      <div className="absolute top-3 right-3 z-10">
                        <StatusBadge status={upload.status} />
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h4 className="text-[12px] font-bold text-text-primary leading-snug mb-1">{upload.name}</h4>
                      <p className="text-[11px] text-text-tertiary mb-4 truncate">{upload.file}</p>

                      <div className="mt-auto pt-3 border-t border-border-primary flex items-center justify-between text-[11px] text-text-tertiary font-semibold">
                        <span>{upload.added.split(' ').slice(0, 2).join(' ')}</span>
                        <span>{upload.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {(() => {
            const fromIndex = processedUploads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
            const toIndex = Math.min(currentPage * itemsPerPage, processedUploads.length);
            const totalPages = Math.ceil(processedUploads.length / itemsPerPage) || 1;
            return (
              <div className="px-6 py-4 flex items-center justify-between bg-bg-tertiary/40 rounded-b-xl relative">
                <div className="flex items-center gap-4">
                  <p className="text-[12px] text-text-secondary font-medium">
                    Showing {fromIndex} to {toIndex} of {processedUploads.length} uploads
                  </p>

                  {/* Dynamic rows-per-page selector dropdown */}
                  <div ref={rowsDropdownRef} className="relative">
                    <button
                      onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                      className="flex items-center gap-1.5 border border-border-primary px-2.5 h-8 rounded-lg text-[12px] text-text-secondary font-semibold bg-bg-secondary hover:text-text-primary transition-all active:scale-95 duration-150"
                    >
                      {itemsPerPage} <ChevronDown size={12} className="text-text-tertiary" />
                    </button>
                    {isRowsDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-20 bg-bg-secondary border border-border-primary rounded-xl shadow-xl z-50 py-1 font-sans">
                        {[5, 10, 25, 50].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              setItemsPerPage(num);
                              setCurrentPage(1);
                              setIsRowsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-[12px] transition-all duration-150 ${itemsPerPage === num
                              ? 'bg-neutral-100 dark:bg-bg-elevated text-text-primary font-bold'
                              : 'text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated/50 font-medium'
                              }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg border border-border-primary text-text-tertiary flex items-center justify-center disabled:opacity-40 transition-premium hover:bg-neutral-50 dark:hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <ChevronRight className="rotate-180" size={13} />
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-lg text-[12px] font-bold flex items-center justify-center transition-premium ${currentPage === p
                        ? 'bg-text-primary dark:bg-white text-white dark:text-black shadow-sm'
                        : 'border border-border-primary text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated hover:text-text-primary'
                        }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg border border-border-primary text-text-tertiary flex items-center justify-center disabled:opacity-40 transition-premium hover:bg-neutral-50 dark:hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })()}
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
      </div>

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
    </PageShell >
  );
}
