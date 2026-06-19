import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  Layers, 
  History, 
  Search, 
  Filter, 
  Plus, 
  ArrowLeft, 
  MoreVertical, 
  Play, 
  Square, 
  RotateCcw, 
  FileDown, 
  Archive, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Eye,
  User, 
  MoreHorizontal, 
  X, 
  Send, 
  Info, 
  ChevronDown, 
  Check,
  Activity,
  Zap,
  ArrowUpRight,
  Target,
  Sparkles,
  AlertTriangle,
  Upload,
  ArrowRight,
  Bell,
  Box,
  Circle,
  Scan,
  RefreshCw,
  Loader2,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import IngestionReview from '../review/IngestionReview';
import techPackImage from '../../assets/images/new_era_techpack_v2_1779277538644.png';
import { metrics as centralizedMetrics, recentBatches as centralizedRecentBatches, exceptions as centralizedExceptions } from '../../data';

interface BatchManagerModuleProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function BatchManagerModule({ initialTab = 'manager-dashboard', onTabChange }: BatchManagerModuleProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedExceptionItem, setSelectedExceptionItem] = useState<any>(null);
  const [isMappingRulesOpen, setIsMappingRulesOpen] = useState(false);
  const [isMappingDrawerOpen, setIsMappingDrawerOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedBatchId('B-117');
      setActiveTab('batch-detail');
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleBatchClick = (id: string) => {
    setSelectedBatchId(id);
    setActiveTab('batch-detail');
  };

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setActiveTab('item-detail');
  };

  const handleGoBack = () => {
    if (activeTab === 'item-detail') {
      setActiveTab('batch-detail');
      setSelectedItemId(null);
    } else if (activeTab === 'batch-detail' || activeTab === 'exceptions-queue') {
      setActiveTab('manager-batches');
      setSelectedBatchId(null);
    }
  };

  // Content rendering
  const renderContent = () => {
    switch (activeTab) {
      case 'manager-dashboard':
        return <DashboardView onBatchClick={handleBatchClick} onTileClick={(filter) => setActiveTab('manager-batches')} onUploadClick={() => fileInputRef.current?.click()} />;
      case 'manager-batches':
        return <BatchListView onBatchClick={handleBatchClick} onUploadClick={() => fileInputRef.current?.click()} />;
      case 'manager-exceptions':
        return <GlobalExceptionsView onResolve={(item) => { setSelectedExceptionItem(item); setActiveTab('exception-resolution'); }} />;
      case 'manager-presets':
        return <PresetsView />;
      case 'batch-detail':
        return <BatchDetailView batchId={selectedBatchId!} onBack={handleGoBack} onOpenMappingRules={() => setIsMappingRulesOpen(true)} onExceptionClick={() => setActiveTab('exceptions-queue')} onItemClick={handleItemClick} onUploadClick={() => fileInputRef.current?.click()} />;
      case 'exceptions-queue':
        return <ExceptionQueueView batchId={selectedBatchId!} onBack={handleGoBack} onResolve={(item) => { setSelectedExceptionItem(item); setActiveTab('exception-resolution'); }} />;
      case 'item-detail':
        return <BatchItemDetailView itemId={selectedItemId!} batchId={selectedBatchId!} onBack={handleGoBack} />;
      case 'exception-resolution':
        return <ExceptionResolutionView item={selectedExceptionItem} onBack={() => setActiveTab('manager-exceptions')} onSubmit={() => setActiveTab('manager-exceptions')} />;
      case 'ingestion-review':
        return <IngestionReview onBack={() => setActiveTab('manager-dashboard')} onApprove={() => { setSelectedBatchId('B-117'); setActiveTab('batch-detail'); }} />;
      default:
        return <DashboardView onBatchClick={handleBatchClick} onTileClick={() => {}} onUploadClick={() => fileInputRef.current?.click()} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black transition-all duration-300">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      {renderContent()}
      
      <AnimatePresence>
        {isMappingRulesOpen && (
          <MappingRulesPanel onClose={() => setIsMappingRulesOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMappingDrawerOpen && (
          <MappingDrawer onClose={() => setIsMappingDrawerOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function DashboardView({ onBatchClick, onTileClick, onUploadClick }: { onBatchClick: (id: string) => void; onTileClick: (filter: string) => void; onUploadClick: () => void }) {
  const metrics = centralizedMetrics;
  const recentBatches = centralizedRecentBatches;
  const exceptions = centralizedExceptions;

  return (
    <main className="pl-16 peer-hover:pl-48 pt-16 py-8 px-[48px] w-full bg-slate-100 dark:bg-black transition-all duration-300">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight">Batch Manager Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Holistic view of tech pack ingestion and generation pipeline health.</p>
        </div>
        <button 
          onClick={onUploadClick}
          className="flex items-center gap-3 rounded-lg bg-black dark:bg-white px-8 h-14 text-[13px] font-bold tracking-widest text-white dark:text-black uppercase transition-all hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98] shadow-xl shadow-black/10 dark:shadow-none"
        >
          <Upload size={18} />
          Batch Upload
        </button>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-8">
        {metrics.map((m, i) => (
          <button 
            key={i}
            onClick={() => onTileClick(m.label)}
            className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-none hover:border-slate-200 dark:hover:border-white/20 transition-all text-left group"
          >
            <span className={`block text-[32px] font-bold ${m.color} leading-none mb-2`}>{m.count}</span>
            <span className="block text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest leading-tight">{m.label}</span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">{m.delta}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none mb-8 overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">Active Batches</h2>
          <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" placeholder="Search batches..." className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/20 text-slate-900 dark:text-white font-medium" />
             </div>
             <button className="p-2 border border-slate-100 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400">
               <Filter size={18} />
             </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
            <tr>
              <th className="px-6 py-4">Batch ID</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Received</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Mapped</th>
              <th className="px-6 py-4">Unmapped</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5 font-medium">
            {recentBatches.map((b) => (
              <tr key={b.id} className="group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative">
                <td className="px-6 py-5">
                  <span className="font-mono text-slate-900 dark:text-white">{b.id}</span>
                </td>
                <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px]">{b.source}</td>
                <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px]">{b.date}</td>
                <td className="px-6 py-5 text-slate-900 dark:text-white">{b.total}</td>
                <td className="px-6 py-5 text-emerald-600 dark:text-emerald-400">{b.mapped}</td>
                <td className="px-6 py-5 text-rose-500 dark:text-rose-400">{b.unmapped}</td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    b.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' :
                    b.status === 'Exception' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20' :
                    b.status === 'Processing' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20' :
                    'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/10'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                    b.priority === 'High' ? 'text-rose-500 dark:text-rose-400' : 
                    b.priority === 'Normal' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      b.priority === 'High' ? 'bg-rose-500' : 
                      b.priority === 'Normal' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                    {b.priority}
                  </span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => onBatchClick(b.id)}
                       className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                     >
                       <ChevronRight size={18} />
                     </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-8 pb-12">
        <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden h-full flex flex-col transition-all">
          <div className="p-6 border-b border-slate-50 dark:border-white/5">
            <h2 className="text-[18px] font-bold text-slate-900 dark:text-white font-sans">Exception Queue Summary</h2>
          </div>
          <div className="p-6 flex-1">
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-white/5 font-sans">
                <tr>
                  <th className="pb-4">Item ID</th>
                  <th className="pb-4">Style</th>
                  <th className="pb-4">Batch</th>
                  <th className="pb-4">Reason</th>
                  <th className="pb-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 font-medium font-sans">
                {exceptions.map((e) => (
                  <tr key={e.id} className="group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative">
                    <td className="py-4 text-[13px] text-slate-900 dark:text-white font-bold">{e.id}</td>
                    <td className="py-4 text-[13px] text-slate-500 dark:text-slate-400">{e.style}</td>
                    <td className="py-4 text-[13px] text-slate-500 dark:text-slate-400">{e.batch}</td>
                    <td className="py-4">
                      <span className="text-[11px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider">{e.reason}</span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 uppercase tracking-widest px-3 py-1.5 rounded-md border border-blue-100 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 transition-all shadow-sm">Resolve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden h-full flex flex-col transition-all">
          <div className="p-6 border-b border-slate-50 dark:border-white/5">
            <h2 className="text-[18px] font-bold text-slate-900 dark:text-white font-sans">SLA Aging</h2>
          </div>
          <div className="p-6 flex-1">
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-white/5 font-sans">
                <tr>
                  <th className="pb-4">Batch ID</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Time in Status</th>
                  <th className="pb-4 text-right">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 font-medium font-sans">
                {[
                  { id: 'BTCH-2026-0338', status: 'Mapping', time: '14h 22m', risk: 'High' },
                  { id: 'BTCH-2026-0339', status: 'Exception', time: '8h 12m', risk: 'Medium' },
                  { id: 'BTCH-2026-0340', status: 'Processing', time: '4h 45m', risk: 'Low' },
                  { id: 'BTCH-2026-0337', status: 'Awaiting Review', time: '22h 10m', risk: 'High' },
                ].map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative">
                    <td className="py-5 text-[13px] text-slate-900 dark:text-white font-bold">{s.id}</td>
                    <td className="py-5 text-[13px] text-slate-500 dark:text-slate-400">{s.status}</td>
                    <td className="py-5 text-[13px] text-slate-500 dark:text-slate-400">{s.time}</td>
                    <td className="py-5 text-right font-sans">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        s.risk === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' : 
                        s.risk === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                      }`}>{s.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function BatchListView({ onBatchClick, onUploadClick }: { onBatchClick: (id: string) => void; onUploadClick: () => void }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Incoming', 'Mapping Required', 'Processing', 'Exception', 'Completed'];

  const allBatches = [
    { id: 'BTCH-2026-0341', source: 'EasyVariant', date: '2026-05-20 08:30', total: 120, mapped: 120, unmapped: 0, status: 'Completed', priority: 'High', due: '2026-05-21', operator: 'Sarah J.', season: 'Spring 25' },
    { id: 'BTCH-2026-0342', source: 'Manual Upload', date: '2026-05-20 09:15', total: 45, mapped: 31, unmapped: 14, status: 'Exception', priority: 'Normal', due: '2026-05-22', operator: 'Mark T.', season: 'Summer 25' },
    { id: 'BTCH-2026-0343', source: 'EasyVariant', date: '2026-05-20 10:00', total: 88, mapped: 88, unmapped: 0, status: 'Processing', priority: 'High', due: '2026-05-21', operator: 'Sarah J.', season: 'Spring 25' },
    { id: 'BTCH-2026-0344', source: 'EasyVariant', date: '2026-05-20 10:45', total: 210, mapped: 180, unmapped: 30, status: 'Mapping', priority: 'Low', due: '2026-05-25', operator: 'Unassigned', season: 'Autumn 25' },
    { id: 'BTCH-2026-0345', source: 'Manual Upload', date: '2026-05-20 11:30', total: 60, mapped: 60, unmapped: 0, status: 'Incoming', priority: 'Normal', due: '2026-05-23', operator: 'Mark T.', season: 'Summer 25' },
    { id: 'BTCH-2026-0340', source: 'EasyVariant', date: '2026-05-19 14:20', total: 150, mapped: 150, unmapped: 0, status: 'Completed', priority: 'Normal', due: '2026-05-20', operator: 'Sarah J.', season: 'Spring 25' },
    { id: 'BTCH-2026-0339', source: 'Manual Upload', date: '2026-05-19 10:10', total: 30, mapped: 30, unmapped: 0, status: 'Completed', priority: 'Low', due: '2026-05-22', operator: 'Mark T.', season: 'Summer 25' },
    { id: 'BTCH-2026-0338', source: 'EasyVariant', date: '2026-05-19 09:00', total: 200, mapped: 200, unmapped: 0, status: 'Awaiting Review', priority: 'High', due: '2026-05-20', operator: 'Sarah J.', season: 'Winter 24' },
    { id: 'BTCH-2026-0337', source: 'Manual Upload', date: '2026-05-18 16:45', total: 50, mapped: 50, unmapped: 0, status: 'Completed', priority: 'Normal', due: '2026-05-19', operator: 'Mark T.', season: 'Winter 24' },
    { id: 'BTCH-2026-0336', source: 'EasyVariant', date: '2026-05-18 11:30', total: 75, mapped: 75, unmapped: 0, status: 'Completed', priority: 'Low', due: '2026-05-21', operator: 'Sarah J.', season: 'Winter 24' },
  ];

  return (
    <main className="pl-16 peer-hover:pl-48 pt-16 py-8 px-[48px] w-full">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">Batches</h1>
          <p className="text-slate-500 font-medium mt-1">Manage all tech pack batch life cycles.</p>
        </div>
        <button 
          onClick={onUploadClick}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-black/10"
        >
          <Upload size={16} />
          Upload Batch
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 bg-slate-50/50 p-1 rounded-xl w-max border border-slate-100">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeFilter === f ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" placeholder="Search batch ID, operator..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm w-80" />
             </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Showing {allBatches.length} Batches</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Batch ID</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Operator</th>
              <th className="px-6 py-4">Items</th>
               <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Season</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium font-sans">
            {allBatches.map((b) => (
              <tr key={b.id} className="group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative">
                <td className="px-6 py-5">
                   <button onClick={() => onBatchClick(b.id)} className="font-mono text-slate-900 hover:text-blue-600 transition-all">{b.id}</button>
                </td>
                <td className="px-6 py-5 text-slate-500 text-[13px]">{b.source}</td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <User size={12} className="text-slate-400" />
                     </div>
                     <span className="text-[13px] text-slate-600">{b.operator}</span>
                   </div>
                </td>
                <td className="px-6 py-5 text-slate-900">{b.total}</td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    b.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    b.status === 'Exception' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    b.status === 'Processing' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                    'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                    b.priority === 'High' ? 'text-rose-500' : 
                    b.priority === 'Normal' ? 'text-blue-500' : 'text-slate-400'
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      b.priority === 'High' ? 'bg-rose-500' : 
                      b.priority === 'Normal' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                    {b.priority}
                  </span>
                </td>
                <td className="px-6 py-5 text-slate-500 text-[13px]">{b.due}</td>
                <td className="px-6 py-5 text-slate-500 text-[13px]">{b.season}</td>
                <td className="px-6 py-5 text-right">
                   <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                     <MoreHorizontal size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function BatchDetailView({ batchId, onBack, onOpenMappingRules, onExceptionClick, onItemClick, onUploadClick }: { batchId: string; onBack: () => void; onOpenMappingRules: () => void; onExceptionClick: () => void; onItemClick: (id: string) => void; onUploadClick: () => void }) {
  const [activeTab, setActiveTab] = useState('All Items');
  const tabs = ['All Items', 'Unmapped', 'Low Confidence', 'Parked', 'Processing', 'Failed', 'Awaiting Review', 'Approved', 'Pushed'];

  if (batchId === 'B-117') {
    return (
      <main className="pl-16 peer-hover:pl-48 pt-16 py-8 px-[48px] w-full bg-slate-100 dark:bg-black transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[40px] font-bold text-slate-900 dark:text-white tracking-tight">B-117</h1>
          <button onClick={onUploadClick} className="flex items-center gap-2 px-8 h-14 bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-2xl shadow-black/20 dark:shadow-none">
            <Upload size={18} />
            Upload New Batch
          </button>
        </div>

        <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Real-Time Progress</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search items..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/20 w-48 text-slate-900 dark:text-white" 
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <Square size={12} fill="currentColor" className="text-slate-400" />
                Pause All
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <Filter size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#FAF9F9] dark:bg-white/5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
              <tr>
                <th className="px-8 py-5">Batch ID</th>
                <th className="px-8 py-5">Style Range</th>
                <th className="px-8 py-5">Techpack</th>
                <th className="px-8 py-5 w-[400px]">Status & Progress</th>
                <th className="px-8 py-5">SLA Status</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5 font-sans">
              <tr className="group">
                <td className="px-8 py-6">
                  <span className="text-[14px] font-bold text-slate-900 dark:text-white">B-117-X</span>
                </td>
                <td className="px-8 py-6 text-[12px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">59FIFTY</td>
                <td className="px-8 py-6 text-[12px] font-bold text-slate-900 dark:text-white tracking-wide">LA DODGERS HOME ROYAL</td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Completed</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 dark:bg-emerald-400 w-full" />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">On Track</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <button onClick={() => onItemClick('B-117-X')} className="px-6 py-2 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none">View</button>
                </td>
              </tr>
              <tr className="group">
                <td className="px-8 py-6">
                  <span className="text-[14px] font-bold text-slate-900 dark:text-white">B-117-Y</span>
                </td>
                <td className="px-8 py-6 text-[12px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">59FIFTY</td>
                <td className="px-8 py-6 text-[12px] font-bold text-slate-900 dark:text-white tracking-wide">NY YANKEES NAVY CLASSIC</td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <RotateCcw size={14} className="animate-spin" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Scanning</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">13%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '13%' }} className="h-full bg-blue-500 dark:bg-blue-400" />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Pending</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <button onClick={() => onItemClick('B-117-Y')} className="px-6 py-2 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none">View</button>
                </td>
              </tr>
              <tr className="group">
                <td className="px-8 py-6">
                  <span className="text-[14px] font-bold text-slate-900 dark:text-white">B-117-Z</span>
                </td>
                <td className="px-8 py-6 text-[12px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">59FIFTY</td>
                <td className="px-8 py-6 text-[12px] font-bold text-slate-900 dark:text-white tracking-wide">TEAM VARIANT STYLE</td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                        <Zap size={14} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Extracting</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">78%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '78%' }} className="h-full bg-blue-500 dark:bg-blue-400" />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">On Track</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <button onClick={() => onItemClick('B-117-Z')} className="px-6 py-2 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    );
  }

  const stages = [
    { label: 'Incoming', count: 120 },
    { label: 'Mapped', count: 90 },
    { label: 'Unmapped', count: 14 },
    { label: 'Parked', count: 6 },
    { label: 'Processing', count: 10 },
    { label: 'Generated', count: 8 },
    { label: 'Auto-Check Passed', count: 7 },
    { label: 'Auto-Check Failed', count: 1 },
    { label: 'Awaiting Review', count: 7 },
    { label: 'Approved', count: 0 },
    { label: 'Rejected', count: 0 },
    { label: 'Pushed Downstream', count: 0 },
  ];

  const items = [
    { id: 'ITEM-00892', style: '60435652', color: 'Black/Red', silhouette: '59FIFTY', prompt: '59FIFTY-Standard-Front', confidence: 'Exact', status: 'Generated', approval: 'Pending', downstream: 'Pending' },
    { id: 'ITEM-00893', style: '70AFBSLG', color: 'Navy', silhouette: '9FORTY', prompt: '-', confidence: 'Unmapped', status: 'Queued', approval: '-', downstream: '-' },
    { id: 'ITEM-00894', style: '60435652', color: 'Green', silhouette: '59FIFTY', prompt: '59FIFTY-V2-Side', confidence: 'Low', status: 'Generating', approval: '-', downstream: '-' },
    { id: 'ITEM-00895', style: '70AFBSLG', color: 'Grey', silhouette: '59FIFTY', prompt: '59FIFTY-Standard-Front', confidence: 'Partial', status: 'Completed', approval: 'Pending', downstream: 'Pending' },
    { id: 'ITEM-00896', style: '60435652', color: 'White', silhouette: '9TWENTY', prompt: '9TWENTY-Classic', confidence: 'Exact', status: 'Completed', approval: 'Approved', downstream: 'Sent' },
    { id: 'ITEM-00897', style: '70AFBSLG', color: 'Red', silhouette: '59FIFTY', prompt: '-', confidence: 'Unmapped', status: 'Queued', approval: '-', downstream: '-' },
    { id: 'ITEM-00898', style: '60435652', color: 'Black', silhouette: '59FIFTY', prompt: '59FIFTY-Standard-Front', confidence: 'Exact', status: 'Completed', approval: 'Approved', downstream: 'Sent' },
    { id: 'ITEM-00899', style: '70AFBSLG', color: 'Blue', silhouette: '9FORTY', prompt: '9FORTY-Standard', confidence: 'Partial', status: 'Completed', approval: 'Pending', downstream: 'Pending' },
    { id: 'ITEM-00900', style: '60435652', color: 'Yellow', silhouette: '59FIFTY', prompt: '59FIFTY-Standard-Front', confidence: 'Exact', status: 'Completed', approval: 'Approved', downstream: 'Sent' },
    { id: 'ITEM-00901', style: '70AFBSLG', color: 'Orange', silhouette: '59FIFTY', prompt: '59FIFTY-Standard-Front', confidence: 'Partial', status: 'Completed', approval: 'Pending', downstream: 'Pending' },
  ];

  return (
    <main className="pl-16 peer-hover:pl-48 pt-16 py-8 px-[48px] w-full bg-slate-100 dark:bg-black transition-all duration-300">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[12px] font-bold uppercase tracking-widest">Back to Batches</span>
        </button>

        <div className="flex items-start justify-between">
           <div>
             <div className="flex items-center gap-4 mb-2">
               <h1 className="text-[32px] font-mono font-bold text-slate-900 dark:text-white tracking-tight">{batchId}</h1>
               <span className="px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-500/20">EasyVariant</span>
               <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20'}`}>High Priority</span>
               <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'}`}>Exception</span>
             </div>
             <div className="flex items-center gap-8 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
               <span>Received: <span className="text-slate-900 dark:text-white">2026-05-20 08:30</span></span>
               <span>Due: <span className="text-slate-900 dark:text-white">2026-05-21</span></span>
               <span>Season: <span className="text-slate-900 dark:text-white">Spring 25</span></span>
               <span>Operator: <span className="text-slate-900 dark:text-white font-bold">Sarah J.</span></span>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <button disabled className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg disabled:opacity-30 flex items-center gap-2">
               <Zap size={14} />
               Trigger Processing
             </button>
             <button className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Retry Failed</button>
             <button onClick={onOpenMappingRules} className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Mapping Rules</button>
             <button className="p-2 border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
               <MoreVertical size={18} />
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none p-2 mb-8 flex overflow-x-auto no-scrollbar scroll-smooth">
        {stages.map((s, i) => (
          <button 
            key={i}
            onClick={() => s.label === 'Unmapped' && onExceptionClick()}
            className="flex-1 min-w-[120px] p-4 group hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all text-center relative border-r last:border-r-0 border-slate-50 dark:border-white/5"
          >
            <span className={`block text-[22px] font-bold mb-1 ${s.label === 'Unmapped' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{s.count}</span>
            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight whitespace-pre-wrap">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-white/5">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
             {tabs.map((t) => (
               <button
                 key={t}
                 onClick={() => setActiveTab(t)}
                 className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                   activeTab === t ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg shadow-black/10 dark:shadow-none' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                 }`}
               >
                 {t}
               </button>
             ))}
           </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
            <tr>
              <th className="px-6 py-4">Item ID</th>
              <th className="px-6 py-4">Style</th>
              <th className="px-6 py-4">Colorway</th>
              <th className="px-6 py-4">Silhouette</th>
              <th className="px-6 py-4">Mapped Prompt</th>
              <th className="px-6 py-4">Confidence</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5 font-medium font-sans">
            {items.map((it) => (
              <tr key={it.id} className="group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative">
                <td className="px-6 py-5">
                   <button onClick={() => onItemClick(it.id)} className="font-mono text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all">{it.id}</button>
                </td>
                <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px]">{it.style}</td>
                <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px]">{it.color}</td>
                <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-[13px]">{it.silhouette}</td>
                <td className="px-6 py-5">
                   {it.prompt === '-' ? (
                     <button onClick={onExceptionClick} className="text-[11px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-2 py-1 rounded transition-all">
                        Map Now
                        <ArrowUpRight size={12} />
                     </button>
                   ) : (
                     <span className="text-[13px] text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/20 border-dotted hover:border-slate-900 dark:hover:border-white cursor-help transition-all">{it.prompt}</span>
                   )}
                </td>
                <td className="px-6 py-5">
                   {renderConfidence(it.confidence)}
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                    it.status === 'Completed' ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {it.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                   <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-all">
                     <Info size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function renderConfidence(level: string) {
  switch (level) {
    case 'Exact':
      return <div className="flex items-center gap-2 text-emerald-500 font-bold text-[11px]"><CheckCircle2 size={14} /> Exact Match</div>;
    case 'Partial':
      return <div className="flex items-center gap-2 text-blue-500 font-bold text-[11px]"><Circle size={14} /> Partial Match</div>;
    case 'Low':
      return <div className="flex items-center gap-2 text-amber-500 font-bold text-[11px]"><AlertCircle size={14} /> Low Confidence</div>;
    case 'Unmapped':
      return <div className="text-slate-300 font-bold text-[11px]">—</div>;
    default:
      return null;
  }
}

function PresetsView() {
  const presets = [
    { name: 'Standard 59FIFTY Crown', type: 'Mesh/Solid', usage: '48.2k', stability: '99.9%' },
    { name: 'Metallic Stitching V2', type: 'Detail', usage: '12.1k', stability: '98.5%' },
    { name: 'Contrast Visor Pattern', type: 'Pattern', usage: '8.4k', stability: '99.2%' },
    { name: 'Inside Tech Labels', type: 'Internal', usage: '22.9k', stability: '99.5%' },
    { name: '3D Puff Embroidery', type: 'Detail', usage: '31.2k', stability: '97.8%' },
    { name: 'Standard 9FORTY Profile', type: 'Crown', usage: '18.5k', stability: '99.7%' },
  ];

  return (
    <main className="pl-24 pt-16 min-h-screen bg-slate-100 dark:bg-black transition-all duration-300">
      <div className="w-full py-8 px-[48px]">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">Prompt Presets</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and review prompt mappings for automatic ingestion.</p>
          </div>
          <button className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg shadow-black/10 dark:shadow-none">Request New Preset</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map((preset, idx) => (
            <div key={idx} className="bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 p-8 hover:shadow-xl dark:hover:shadow-none transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-all">
                  <Target size={20} />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest">Active</span>
              </div>
              <h3 className="text-[18px] font-bold text-slate-900 dark:text-white mb-1">{preset.name}</h3>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{preset.type}</span>
              
              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 grid grid-cols-2 gap-4">
                 <div>
                   <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Usage</span>
                   <span className="text-[16px] font-bold text-slate-900 dark:text-white">{preset.usage}</span>
                 </div>
                 <div>
                   <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stability</span>
                   <span className="text-[16px] font-bold text-slate-900 dark:text-white">{preset.stability}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function GlobalExceptionsView({ onResolve }: { onResolve: (item: any) => void }) {
  const [activeChip, setActiveChip] = useState('Total');
  const chips = ['Total', 'Missing Metadata', 'No Matching Prompt', 'Rule Conflict'];

  const items = [
    { id: 'ITEM-00892', style: '60435652', batch: 'BTCH-2026-0342', color: 'Gold', silhouette: '59FIFTY', reason: 'Missing Metadata', description: 'The tech pack is missing key metadata fields (silhouette not detected, material unknown, etc.)' },
    { id: 'ITEM-00893', style: '70AFBSLG', batch: 'BTCH-2026-0342', color: 'Velvet', silhouette: '9FORTY', reason: 'No Matching Prompt', description: 'No published prompt preset exists that covers this product type' },
    { id: 'ITEM-00894', style: '60435652', batch: 'BTCH-2026-0342', color: 'Diamond Mesh', silhouette: '59FIFTY', reason: 'Missing Metadata', description: 'The tech pack is missing key metadata fields (silhouette not detected, material unknown, etc.)' },
    { id: 'ITEM-00895', style: '70AFBSLG', batch: 'BTCH-2026-0342', color: 'Contrast Stitch', silhouette: '59FIFTY', reason: 'Rule Conflict', description: 'Two or more rules match the item and conflict with each other, so the system cannot decide.' },
  ];

  return (
    <main className="pl-24 pt-16 py-12 px-[48px] max-w-[1600px] mx-auto min-h-screen bg-slate-100 dark:bg-black transition-all duration-300">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">Global Exceptions</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">System metadata or rule conflicts requiring immediate manual attention.</p>
      </div>

      <div className="flex items-center gap-3 mb-10">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setActiveChip(c)}
            className={`px-6 py-4 rounded-xl border font-bold text-[11px] uppercase tracking-widest transition-all ${
              activeChip === c ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm dark:shadow-none' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-white/20'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
            <tr>
              <th className="px-6 py-4">Item ID</th>
              <th className="px-6 py-4">Batch ID</th>
              <th className="px-6 py-4">Style/Color</th>
              <th className="px-6 py-4">Exception Reason</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5 font-medium font-sans">
            {items.map((it) => (
              <tr key={it.id} className="group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative">
                <td className="px-6 py-5">
                   <button onClick={() => onResolve(it)} className="font-mono text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold">{it.id}</button>
                </td>
                <td className="px-6 py-5 text-slate-500 dark:text-slate-400 font-mono text-[13px]">{it.batch}</td>
                <td className="px-6 py-5">
                   <div className="text-[13px] text-slate-900 dark:text-white font-bold">{it.style}</div>
                   <div className="text-[11px] text-slate-400 dark:text-slate-500">{it.color}</div>
                </td>
                <td className="px-6 py-5 max-w-md">
                   <span className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">{it.reason}</span>
                   <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{it.description}</p>
                </td>
                <td className="px-6 py-5 text-right">
                   <button 
                     onClick={() => onResolve(it)} 
                     className="px-6 py-2 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white transition-all font-sans"
                   >
                     View
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function ExceptionQueueView({ batchId, onBack, onResolve }: { batchId: string; onBack: () => void; onResolve: (item: any) => void }) {
  const [activeChip, setActiveChip] = useState('Total');
  const chips = ['Total', 'Missing Metadata', 'No Matching Prompt', 'Rule Conflict'];

  const items = [
    { id: 'ITEM-00892', style: '60435652', color: 'Gold', silhouette: '59FIFTY', reason: 'Missing Metadata', description: 'The tech pack is missing key metadata fields (silhouette not detected, material unknown, etc.)' },
    { id: 'ITEM-00893', style: '70AFBSLG', color: 'Velvet', silhouette: '9FORTY', reason: 'No Matching Prompt', description: 'No published prompt preset exists that covers this product type' },
    { id: 'ITEM-00894', style: '60435652', color: 'Diamond Mesh', silhouette: '59FIFTY', reason: 'Missing Metadata', description: 'The tech pack is missing key metadata fields (silhouette not detected, material unknown, etc.)' },
    { id: 'ITEM-00895', style: '70AFBSLG', color: 'Contrast Stitch', silhouette: '59FIFTY', reason: 'Rule Conflict', description: 'Two or more rules match the item and conflict with each other, so the system cannot decide.' },
  ];

  return (
    <main className="pl-24 pt-16 py-12 px-[48px] max-w-[1600px] mx-auto min-h-screen bg-slate-100 dark:bg-black transition-all duration-300">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[12px] font-bold uppercase tracking-widest">Back to Batch Detail</span>
        </button>

        <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">Exception Queue: <span className="font-mono">{batchId}</span></h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Resolve mapping conflicts and metadata gaps to proceed with generation.</p>
      </div>

      <div className="flex items-center gap-3 mb-10">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setActiveChip(c)}
            className={`px-6 py-4 rounded-xl border font-bold text-[11px] uppercase tracking-widest transition-all ${
              activeChip === c ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm dark:shadow-none' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-white/20'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
            <tr>
              <th className="px-6 py-4">Item ID</th>
              <th className="px-6 py-4">Style/Color</th>
              <th className="px-6 py-4">Exception Reason</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5 font-medium font-sans">
            {items.map((it) => (
              <tr key={it.id} className="group hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative">
                <td className="px-6 py-5">
                   <span className="font-mono font-bold text-slate-900 dark:text-white">{it.id}</span>
                </td>
                <td className="px-6 py-5">
                   <div className="text-[13px] text-slate-900 dark:text-white font-bold">{it.style}</div>
                   <div className="text-[11px] text-slate-400 dark:text-slate-500">{it.color}</div>
                </td>
                <td className="px-6 py-5 max-w-md">
                   <span className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">{it.reason}</span>
                   <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{it.description}</p>
                </td>
                <td className="px-6 py-5 text-right">
                   <button 
                     onClick={() => onResolve(it)} 
                     className="px-6 py-2 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white transition-all font-sans"
                   >
                     View
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function ExceptionResolutionView({ item, onBack, onSubmit }: { item: any, onBack: () => void, onSubmit: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<any>(null);

  const availableMetadata = [
    { label: 'Season', value: 'Spring 2025' },
    { label: 'Style Code', value: item?.style || '60435652' },
    { label: 'Colorway', value: item?.color || 'Black/Red' },
    { label: 'Primary Fabric', value: '100% Polyester' },
    { label: 'Logo Placement', value: 'Front Panels' },
  ];

  const missingMetadata = [
    { label: 'Silhouette', status: 'Incomplete' },
    { label: 'Visor Type', status: 'Detected but Unverified' },
    { label: 'Under visor Color', status: 'Not detected' },
  ];

  const presets = [
    { id: '1', name: 'Standard 59FIFTY Crown', match: 95 },
    { id: '2', name: 'Mesh/Solid Crown Detail', match: 88 },
    { id: '3', name: 'Metallic Stitching V2', match: 72 },
    { id: '4', name: 'Contrast Visor Pattern', match: 65 },
    { id: '5', name: 'Inside Tech Labels', match: 40 },
  ];

  const filteredPresets = presets.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!item) return null;

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <span className="text-[13px] font-bold text-slate-900 mono">{item.id}</span>
             <div className="h-4 w-[1px] bg-slate-200" />
             <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest">{item.reason}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={onSubmit} disabled={!selectedPreset} className={`px-6 h-10 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${selectedPreset ? 'bg-black text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>Map and Submit</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Feed */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 pt-6 px-12 pb-6 lg:pt-6 lg:px-16 lg:pb-6 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-8">
             <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all group">
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
               <span className="text-[12px] font-bold uppercase tracking-widest">Back to Exceptions</span>
             </button>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Techpack Preview - Left column */}
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="text-[14px] font-bold text-slate-900">Techpack Preview</h3>
                      <span className="text-[11px] font-medium text-slate-400">PDF Document • 4.2MB</span>
                    </div>
                    <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center p-8">
                      <img 
                        src={typeof techPackImage === 'object' && techPackImage !== null && 'src' in techPackImage ? (techPackImage as any).src : techPackImage} 
                        className="w-full h-full object-contain rounded-xl shadow-lg border border-slate-100" 
                        alt="Techpack Preview"
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata Column - Right column */}
                <div className="lg:col-span-4 space-y-8">
                   {/* Available Metadata */}
                   <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                      <h3 className="text-[14px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        Extracted Metadata
                      </h3>
                      <div className="space-y-4">
                         {availableMetadata.map((m, i) => (
                           <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                              <span className="text-[12px] font-medium text-slate-400 uppercase tracking-tight">{m.label}</span>
                              <span className="text-[13px] font-bold text-slate-900">{m.value}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Missing Metadata */}
                   <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                      <h3 className="text-[14px] font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-500" />
                        Missing/Unverified Information
                      </h3>
                      <div className="space-y-4">
                         {missingMetadata.map((m, i) => (
                           <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                              <span className="text-[12px] font-medium text-slate-400 uppercase tracking-tight">{m.label}</span>
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-widest">{m.status}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar: Preset Selector */}
        <div className="w-[400px] border-l border-slate-100 bg-white flex flex-col shrink-0">
           <div className="py-6 px-8 border-b border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-[16px] font-bold text-slate-900">Map with Preset</h3>
                 <Sparkles size={18} className="text-blue-500" />
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search prompt presets..." 
                   className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-sans"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Recommended Mappings</p>
              {filteredPresets.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all relative group cursor-pointer ${
                    selectedPreset === p.id 
                      ? 'border-blue-500 bg-blue-50/30 shadow-md' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[14px] font-bold text-slate-900">{p.name}</span>
                     {p.match > 80 && (
                       <div className="flex items-center gap-1.5">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-tighter">AI Match {p.match}%</span>
                       </div>
                     )}
                  </div>
                  <p className="text-[12px] text-slate-400 leading-snug line-clamp-2 mb-4">Standard extraction logic for {p.name.toLowerCase()} Silhouettes.</p>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewingPrompt(p); }}
                      className="px-3 py-1.5 bg-slate-50 text-[9px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                      <Eye size={12} />
                      View Prompt
                    </button>
                    {selectedPreset === p.id && (
                      <div className="text-blue-500 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Selected</span>
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
           </div>

           <div className="py-6 px-8 border-t border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <button 
                  onClick={onSubmit}
                  disabled={!selectedPreset}
                  className={`flex-1 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${
                    selectedPreset 
                      ? 'bg-black text-white hover:bg-slate-800 shadow-black/10' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Submit Resolution
                </button>
                <button 
                  className="w-12 h-12 flex items-center justify-center shrink-0 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm group relative"
                >
                  <Info size={20} />
                  <div className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-y-2 group-hover:translate-y-0 z-50">
                    Resolving this exception will re-queue the item for automated ingestion.
                    <div className="absolute top-full right-4 w-3 h-3 bg-slate-900 rotate-45 -translate-y-1.5" />
                  </div>
                </button>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {viewingPrompt && (
          <PromptPreviewModal 
            preset={viewingPrompt} 
            onClose={() => setViewingPrompt(null)} 
            onSelect={() => {
              setSelectedPreset(viewingPrompt.id);
              setViewingPrompt(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PromptPreviewModal({ preset, onClose, onSelect }: { preset: any, onClose: () => void, onSelect: () => void }) {
  const promptParts = [
    { label: 'Front View', prompt: 'Analyze the front panel for embroidery density and stitch directional flow. Identify any irregularities in the primary logo application.' },
    { label: 'Crown', prompt: 'Assess the structural integrity of the 6-panel crown. Verify the seam alignment and top button centering.' },
    { label: 'Visor', prompt: 'Inspect the visor curvature and stitching rows. Check for any material bubbling or underside color discrepancies.' },
    { label: 'Side View', prompt: 'Examine the side profiles for secondary logo placements or flag embroidery. Ensure proportions match standard 59FIFTY specs.' },
    { label: 'Eyelets', prompt: 'Verify the count and placement of stitched eyelets. Identify if color matches the crown fabric or uses contrast thread.' },
    { label: 'Logo', prompt: 'Deep dive into the primary logo design elements. Check for specific PMS color accuracy and raised embroidery height.' },
    { label: 'Logo Placement', prompt: 'Calculate exact coordinates of the logo relative to the central crown seam. Must be centered within 0.5mm tolerance.' },
    { label: 'Logo Color', prompt: 'Identify all thread colors used in the logo. Map them against the provided PMS color swatches: H Red M1638, Real Black 5596, etc.' },
    { label: 'Sweatband', prompt: 'Check the internal sweatband material and branding labels. Verify the size tag accuracy for 58.7cm / 7 3/8.' },
    { label: 'Back View', prompt: 'Analyze the rear panels for the MLB Batterman or other logo placements. Check for proper centering on the rear seam.' },
    { label: 'Stitch Color', prompt: 'Identify the thread color used for structural seams. Confirm if it is tonal or contrast-stitched.' },
    { label: 'Stitch Style', prompt: 'Verify the stitch length and style across all components. Look for standard industrial lockstitch patterns.' },
    { label: 'Top View', prompt: 'Observe the cap from directly above to ensure perfect geometric symmetry of the panels and visor alignment.' },
    { label: 'Color Specs', prompt: 'Confirm overall color compliance with seasonal brand guidelines. Match fabric hue against physical master samples.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-black w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
               <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{preset.name} - Detailed Prompt</h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">AI Analysis Logic Breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promptParts.map((part, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/30 dark:bg-white/5 hover:border-blue-200 dark:hover:border-blue-500 transition-all group">
                 <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-2 group-hover:text-blue-500 transition-all">{part.label}</h4>
                 <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed italic">"{part.prompt}"</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="p-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-white/5">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 uppercase tracking-widest transition-all"
          >
            Close
          </button>
          <button 
            onClick={onSelect}
            className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg shadow-black/10 dark:shadow-none"
          >
            Select this Prompt
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
}

function MappingDrawer({ onClose }: { onClose: () => void }) {
  const [overrideReason, setOverrideReason] = useState('');
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="fixed top-0 right-0 h-full w-[500px] bg-white dark:bg-black border-l border-slate-100 dark:border-white/10 z-[101] shadow-2xl dark:shadow-none flex flex-col transition-all duration-300"
      >
        <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
           <div>
             <h2 className="text-[22px] font-bold text-slate-900 dark:text-white">Resolve Mapping</h2>
             <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-1 uppercase tracking-widest font-bold">ITEM-00892 // 60435652</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
           <section>
             <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
               <Info size={14} className="text-blue-500 dark:text-blue-400" />
               Item Metadata
             </h3>
             <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {[
                  { label: 'Silhouette', value: '59FIFTY' },
                  { label: 'Colorway', value: 'Gold Metallic' },
                  { label: 'Style Code', value: '60435652' },
                  { label: 'Material', value: 'Wool Blend', missing: true },
                  { label: 'Decoration', value: 'Puff Embroidery' },
                  { label: 'League', value: 'MLB' },
                ].map((m, i) => (
                  <div key={i}>
                    <span className="block text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-1">{m.label}</span>
                    <span className={`block text-[13px] font-bold ${m.missing ? 'text-rose-500 flex items-center gap-1.5' : 'text-slate-900 dark:text-white'}`}>
                      {m.value} {m.missing && <AlertCircle size={12} />}
                    </span>
                  </div>
                ))}
             </div>
           </section>

           <section>
             <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
               <Target size={14} className="text-emerald-500 dark:text-emerald-400" />
               Select Prompt Preset
             </h3>
             <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search presets..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white" 
                />
             </div>
             <div className="space-y-3">
                {[
                  { name: 'MLB-Wool-Puff-Primary', compatibility: '94%', version: 'v2.1' },
                  { name: 'Standard-59FIFTY-Front-Studio', compatibility: '88%', version: 'v1.4' },
                  { name: 'Metallic-Detail-V4', compatibility: '72%', version: 'v4.0' },
                ].map((p, i) => (
                  <button key={i} className="w-full p-4 border border-slate-100 dark:border-white/10 rounded-xl text-left hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/20 dark:hover:bg-emerald-500/10 transition-all group flex items-center justify-between">
                    <div>
                      <span className="block text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{p.name}</span>
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{p.version}</span>
                    </div>
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold text-[13px]">{p.compatibility}</span>
                  </button>
                ))}
             </div>
           </section>

           <section>
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Override Reason</h3>
               <span className="text-[10px] font-bold text-rose-500 uppercase">Required</span>
             </div>
             <textarea 
               value={overrideReason}
               onChange={(e) => setOverrideReason(e.target.value)}
               placeholder="Explain why this mapping choice is correct..."
               className="w-full h-32 p-4 bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/10 rounded-xl text-[13px] font-medium resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
             />
           </section>
        </div>

        <div className="p-8 border-t border-slate-50 dark:border-white/5 flex items-center gap-3">
          <button 
            disabled={!overrideReason}
            onClick={onClose}
            className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-30 transition-all shadow-lg shadow-black/10 dark:shadow-none"
          >
            Confirm Mapping
          </button>
          <button onClick={onClose} className="px-8 py-4 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Cancel</button>
        </div>
      </motion.div>
    </>
  );
}

function BatchItemDetailView({ itemId, batchId, onBack }: { itemId: string; batchId: string; onBack: () => void }) {
  const timeline = [
    { stage: 'Ingested', actor: 'System', time: '2026-05-20 08:30', descStatus: 'Completed', status: 'completed' },
    { stage: 'Validated', actor: 'System', time: '2026-05-20 08:31', descStatus: 'Completed', status: 'completed' },
    { stage: 'Auto-Mapped', actor: 'System', time: '2026-05-20 08:35', descStatus: 'Failed - Low Confidence', status: 'failed' },
    { stage: 'Exception Queue', actor: 'System', time: '2026-05-20 08:35', descStatus: 'Pending Review', status: 'completed' },
    { stage: 'Manually Mapped', actor: 'Sarah J.', time: '2026-05-20 10:15', descStatus: 'MLB-Wool-Puff Preset Assigned', status: 'completed' },
    { stage: 'Queued for Processing', actor: 'Sarah J.', time: '2026-05-20 10:16', descStatus: 'In Pipeline', status: 'completed' },
    { stage: 'Processing Started', actor: 'Cloud Node 04', time: '2026-05-20 11:02', descStatus: 'Job #JOB-99182', status: 'completed' },
    { stage: 'Generation Complete', actor: 'Cloud Node 04', time: '2026-05-20 11:05', descStatus: '4/4 Angles Generated', status: 'active' },
    { stage: 'Auto-Check Running', actor: 'System', time: '—', descStatus: 'Awaiting results', status: 'future' },
    { stage: 'Manual Review Pending', actor: '—', time: '—', descStatus: 'Locked', status: 'future' },
  ];

  return (
    <main className="pl-24 pt-16 py-12 px-[48px] max-w-[1600px] mx-auto overflow-y-auto bg-slate-100 dark:bg-black transition-all duration-300 min-h-screen">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[12px] font-bold uppercase tracking-widest">Back to Batch Detail</span>
        </button>

        <div className="flex items-start justify-between">
           <div>
             <h1 className="text-[32px] font-mono font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-4">{itemId}</h1>
             <div className="flex items-center gap-6 text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                <span>Style: <span className="text-slate-900 dark:text-white">60435652</span></span>
                <span>Color: <span className="text-slate-900 dark:text-white">Gold Metallic</span></span>
                <span>Silhouette: <span className="text-slate-900 dark:text-white">59FIFTY</span></span>
                <span className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                   Status: Generating
                </span>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start mb-12">
        <div className="col-span-4 space-y-6">
           <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
              <div className="aspect-square bg-slate-50 dark:bg-white/5 flex items-center justify-center border-b border-slate-50 dark:border-white/5">
                 <Box size={64} className="text-slate-200 dark:text-slate-800" />
              </div>
              <div className="p-8">
                 <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Extracted Metadata</h3>
                 <div className="space-y-4">
                    {[
                      { l: 'Material', v: 'Wool-Acrylic Blend' },
                      { l: 'League', v: 'Major League Baseball' },
                      { l: 'Team', v: 'Los Angeles Dodgers' },
                      { l: 'Brim Style', v: 'Flat UnderVisor' },
                      { l: 'Labeling', v: 'Heat Press Vinyl', warn: true },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                         <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{m.l}</span>
                         <span className={`text-[13px] font-bold ${m.warn ? 'text-amber-500 flex items-center gap-2' : 'text-slate-900 dark:text-white'}`}>{m.v} {m.warn && <AlertTriangle size={14} />}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="col-span-4 bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none">
           <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-8">Lifecycle Timeline</h3>
           <div className="space-y-10 relative">
              <div className="absolute left-[11px] top-2 bottom-6 w-px bg-slate-100 dark:bg-white/10" />
              {timeline.map((node, i) => (
                <div key={i} className="relative flex gap-6 group">
                   <div className="relative z-10 flex flex-col items-center pt-1">
                      {node.status === 'completed' && <div className="h-6 w-6 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black transition-all duration-300"><Check size={14} /></div>}
                      {node.status === 'failed' && <div className="h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center text-white transition-all duration-300"><X size={14} /></div>}
                      {node.status === 'active' && <div className="h-6 w-6 rounded-full bg-blue-500 border-[3px] border-white dark:border-black shadow-[0_0_0_1px_#3b82f6] animate-pulse transition-all duration-300" />}
                      {node.status === 'future' && <div className="h-6 w-6 rounded-full bg-white dark:bg-black border-2 border-slate-100 dark:border-white/10 transition-all duration-300" />}
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[14px] font-bold ${node.status === 'future' ? 'text-slate-300 dark:text-slate-700' : 'text-slate-900 dark:text-white'}`}>{node.stage}</span>
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">{node.time}</span>
                      </div>
                      <p className={`text-[12px] font-medium ${node.status === 'failed' ? 'text-rose-500 dark:text-rose-400' : node.status === 'future' ? 'text-slate-300 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                         {node.descStatus} {node.actor !== '—' && <span className="ml-1 opacity-60">by {node.actor}</span>}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="col-span-4 space-y-6">
           <div className="bg-slate-900 dark:bg-white/10 rounded-2xl p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none">
             <div className="flex justify-between items-start mb-6">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Mapped Prompt</h3>
                <Sparkles className="text-blue-400" size={18} />
             </div>
             <p className="text-[18px] font-bold text-white mb-1">MLB-Wool-Puff-Primary</p>
             <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Version 2.1 // SDXL 1.5</p>
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10">View Prompt</button>
           </div>

           <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none">
             <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Processing Details</h3>
             <div className="space-y-4 font-medium">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-300 dark:text-slate-700 tracking-widest mb-1.5">Job ID</span>
                  <span className="font-mono text-[13px] text-slate-900 dark:text-white">JOB-99182-LA-MLB</span>
                </div>
                <div>
                   <span className="block text-[10px] uppercase font-bold text-slate-300 dark:text-slate-700 tracking-widest mb-1.5">Correlation ID</span>
                   <span className="font-mono text-[13px] text-slate-900 dark:text-white">ea71-6622-bf01-9988</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-left">
                    <span className="block text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Retries</span>
                    <span className="text-[14px] font-bold text-slate-900 dark:text-white">0</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Duration</span>
                    <span className="text-[14px] font-bold text-slate-900 dark:text-white">2m 44s</span>
                  </div>
                </div>
             </div>
           </div>

           <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl p-8 shadow-sm dark:shadow-none opacity-40">
             <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Downstream Status</h3>
             <p className="text-[13px] font-medium text-slate-400 dark:text-slate-600">Waiting for generation and approval cycle to complete.</p>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden mb-12">
        <button className="w-full p-8 flex items-center justify-between group">
           <div className="flex items-center gap-4">
              <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">Auto-Check Report</h2>
              <span className="px-2.5 py-1 rounded bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-[0.2em]">Scan Pending</span>
           </div>
           <ChevronDown className="text-slate-300 dark:text-slate-700 group-hover:text-slate-900 dark:group-hover:text-white transition-all transition-all duration-300" size={24} />
        </button>
      </div>
    </main>
  );
}

function MappingRulesPanel({ onClose }: { onClose: () => void }) {
  const [simulationText, setSimulationText] = useState('');
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="fixed top-0 right-0 h-full w-[600px] bg-slate-100 dark:bg-black border-l border-slate-100 dark:border-white/10 z-[101] shadow-2xl dark:shadow-none flex flex-col transition-all duration-300"
      >
        <div className="p-10 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-black">
           <div>
             <h2 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">Mapping Rules</h2>
             <p className="text-slate-500 dark:text-slate-400 font-medium text-[14px] mt-1">View active logic used for automatic ingestion classification.</p>
           </div>
           <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-24">
           <section>
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                   <Zap size={16} className="text-blue-500 fill-blue-500 dark:text-blue-400 dark:fill-blue-400" />
                   Rule Simulation
                 </h3>
                 <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Dev Mode Only</span>
              </div>
              <div className="p-8 bg-slate-900 dark:bg-white/5 rounded-3xl text-white dark:text-slate-200 shadow-2xl shadow-slate-200 dark:shadow-none border border-transparent dark:border-white/10 transition-all duration-300">
                 <p className="text-slate-400 dark:text-slate-500 text-[13px] font-medium mb-4 italic">Paste product attributes below to test classification logic...</p>
                 <textarea 
                   value={simulationText}
                   onChange={e => setSimulationText(e.target.value)}
                   className="w-full h-32 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-2xl p-5 font-mono text-[13px] text-blue-100 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none placeholder:text-slate-600"
                   placeholder='{ "silhouette": "59FIFTY", "league": "MLB", "decoration": "Puff" }'
                 />
                 <button className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">Run Rule Simulation</button>
              </div>
           </section>

           <section>
              <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">Active Pipeline Rules</h3>
              <div className="space-y-6">
                 {[
                   { name: 'Primary Silhouette Class', priority: 1, logic: 'IF Silhouette is 59FIFTY THEN Map to Base 59FIFTY Template', count: 4820 },
                   { name: 'Wool Blend Material Match', priority: 2, logic: 'IF Material contains Wool AND League is MLB THEN Use Wool Texture P7', count: 1241 },
                   { name: 'Metallic Stitching Override', priority: 3, logic: 'IF Colorway contains Metallic THEN Apply Foil Pass v2', count: 334 },
                 ].map((r, i) => (
                   <div key={i} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-3xl shadow-sm dark:shadow-none hover:shadow-xl dark:hover:bg-white/10 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                         <div className="h-10 w-10 bg-slate-50 dark:bg-white/10 flex items-center justify-center rounded-xl group-hover:bg-slate-900 group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-all text-slate-400 dark:text-slate-600">
                           <Target size={20} />
                         </div>
                         <div className="text-right">
                             <span className="block text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-1">Priority</span>
                             <span className="text-[16px] font-bold text-slate-900 dark:text-white">#00{r.priority}</span>
                         </div>
                      </div>
                      <h4 className="text-[18px] font-bold text-slate-900 dark:text-white mb-2">{r.name}</h4>
                      <p className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-mono text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{r.logic}</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Items Classified: <span className="text-slate-900 dark:text-white ml-1">{r.count.toLocaleString()}</span></span>
                         <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-800 dark:hover:text-blue-300 transition-all">Edit Rule</button>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </motion.div>
    </>
  );
}
