import React, { useState, useEffect } from 'react';
import { RotateCw, Cpu, ChevronLeft, ChevronRight, Upload, Check, Loader2, AlertTriangle, Search, Box, Activity, ChevronDown, ChevronsUpDown, LayoutGrid, List, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageShell from '../layout/PageShell';
import StatusBadge from '../ui/StatusBadge';

type TechpackStatus = 'Processing' | 'Completed' | 'Exception';

interface TechpackItem {
  id: string;
  name: string;
  status: TechpackStatus;
  timestamp: string;
}

const generateAlphanumericID = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

import { initialData } from '../../data';

export default function HeadlessIngestion() {
  const [syncStatus, setSyncStatus] = useState('SYNC');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [data, setData] = useState<TechpackItem[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const performSync = (isAuto = false) => {
    setLoading(true);
    setSyncStatus(isAuto ? 'AUTO SYNCING' : 'SYNCING');
    
    // Simulate sync - add a 'new' techpack at top
    setTimeout(() => {
      const newItem: TechpackItem = {
        id: generateAlphanumericID(),
        name: `${Math.floor(Math.random() * 90000000) + 10000000}_${['59FIFTY', 'SNAPBACK', 'BUCKET', 'BEANIE'][Math.floor(Math.random() * 4)]}_${['MINORAC', 'ERISEA', 'VALLEY', 'PEAK'][Math.floor(Math.random() * 4)]}_ERISEA_OTC`,
        status: 'Processing',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };
      setData(prev => [newItem, ...prev]);
      setLoading(false);
      setSyncStatus('SYNC');
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      performSync(true);
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'Techpacks Ingested', value: data.length.toString(), change: '+3 today', icon: <Upload size={16} className="stroke-[1.8]" />, trend: 'up' },
    { label: 'Processed', value: data.filter(d => d.status === 'Completed').length.toString(), change: '98% extraction', icon: <CheckCircle2 size={16} className="stroke-[1.8]" />, trend: 'neutral' },
    { label: 'In Progress', value: data.filter(d => d.status === 'Processing').length.toString(), change: 'Real-time sync', icon: <Clock size={16} className="stroke-[1.8]" />, trend: 'neutral' },
    { label: 'Exceptions', value: data.filter(d => d.status === 'Exception').length.toString(), change: 'Review required', icon: <AlertCircle size={16} className="stroke-[1.8]" />, trend: data.filter(d => d.status === 'Exception').length > 0 ? 'danger' : 'neutral' },
  ];

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (status: TechpackStatus) => {
    switch (status) {
      case 'Processing': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20';
      case 'Completed': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20';
      case 'Exception': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20';
    }
  };

  const getStatusIcon = (status: TechpackStatus) => {
    switch (status) {
      case 'Processing': return <Clock size={12} className="animate-spin-slow" />;
      case 'Completed': return <CheckCircle2 size={12} />;
      case 'Exception': return <AlertCircle size={12} />;
    }
  };

  return (
    <PageShell>
      <div className="w-full py-8 px-8">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="heading-primary leading-tight">Headless Ingestion</h1>
            <p className="text-[14px] text-text-secondary font-medium mt-1 font-sans">Real-time pipeline throughput metrics.</p>
          </div>
          <button 
            onClick={() => performSync()}
            disabled={loading}
            className="btn-upload active:scale-95 shadow-sm disabled:opacity-50 mr-4"
          >
            <RotateCw size={13} className={loading ? "animate-spin" : ""} />
            {syncStatus}
          </button>
        </div>

        <div className="w-full flex flex-col gap-8">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
            {metrics.map((metric, index) => (
              <div 
                key={index} 
                className="premium-card h-[128px] p-5 flex flex-col justify-between cursor-default"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[12px] font-semibold text-text-tertiary uppercase tracking-[0.04em]">{metric.label}</p>
                  <div className="text-text-tertiary transition-colors duration-200">
                    {metric.icon}
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2.5">
                  <h3 className={`text-[36px] font-bold leading-none tracking-[-0.03em] ${metric.label === 'Exceptions' && parseInt(metric.value) > 0 ? 'text-rose-500' : 'text-text-primary'}`}>{metric.value}</h3>
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
          
          {/* Table */}
          <div className="bg-bg-table w-full border border-border-primary shadow-sm rounded-xl">
            {/* Toolbar */}
            <div className="px-6 py-4 flex flex-wrap items-center justify-between border-b border-border-primary bg-bg-tertiary gap-4 rounded-t-xl">
              <h2 className="heading-section">Recent Ingestions</h2>
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
                <button className="flex items-center gap-2 border border-border-primary px-3 h-[42px] rounded-lg text-[13px] text-text-secondary font-medium whitespace-nowrap bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all active:scale-95 duration-150">
                  <Box size={14} className="text-text-tertiary" /> Category <ChevronDown size={14} className="text-text-tertiary" />
                </button>
                <button className="flex items-center gap-2 border border-border-primary px-3 h-[42px] rounded-lg text-[13px] text-text-secondary font-medium whitespace-nowrap bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all active:scale-95 duration-150">
                  <Activity size={14} className="text-text-tertiary" /> Status <ChevronDown size={14} className="text-text-tertiary" />
                </button>
                <div className="w-px h-6 bg-border-primary mx-1 shrink-0"></div>
                <div className="flex bg-neutral-100 dark:bg-white/5 border border-border-primary rounded-lg overflow-hidden shrink-0 transition-all p-[2px]">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-text-primary shadow-sm' : 'text-text-tertiary hover:bg-neutral-50 dark:hover:bg-white/5'}`}>
                    <LayoutGrid size={15} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-text-primary shadow-sm' : 'text-text-tertiary hover:bg-neutral-50 dark:hover:bg-white/5'}`}>
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-primary bg-bg-tertiary/50">
                      <th className="px-6 py-4 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          UPLOAD ID <ChevronsUpDown size={13} className="text-text-tertiary/65" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          TECH PACK NAME <ChevronsUpDown size={13} className="text-text-tertiary/65" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          CLASSIFICATION <ChevronsUpDown size={13} className="text-text-tertiary/65" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          TIME INGESTED <ChevronsUpDown size={13} className="text-text-tertiary/65" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          CONFIDENCE <ChevronsUpDown size={13} className="text-text-tertiary/65" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] text-right whitespace-nowrap">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary">
                    <AnimatePresence initial={false}>
                      {paginatedData.map((item) => (
                        <motion.tr 
                          key={item.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="table-row-hover h-[72px] border-b border-border-primary relative"
                        >
                          <td className="px-6 py-3 font-mono text-text-secondary text-sm">#{item.id}</td>
                          <td className="px-6 py-3 font-semibold text-text-primary text-[14px]">{item.name}</td>
                          <td className="px-6 py-3">
                            <StatusBadge status={item.status === 'Processing' ? 'In Progress' : item.status === 'Completed' ? 'Completed' : 'Halted'} />
                          </td>
                          <td className="px-6 py-3 text-text-secondary font-mono text-sm">{item.timestamp}</td>
                          <td className="px-6 py-3 text-text-secondary font-mono text-sm">98%</td>
                          <td className="px-6 py-3 text-right">
                            <button className="text-[11px] font-bold uppercase tracking-wider px-3.5 h-[34px] rounded-lg border border-border-primary text-text-secondary bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all font-sans active:scale-95 duration-150 shadow-sm">
                              View
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-bg-tertiary/20 border-b border-border-primary">
                <AnimatePresence initial={false}>
                  {paginatedData.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="premium-card p-5 flex flex-col justify-between h-[180px] group cursor-default"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="font-mono text-text-tertiary text-xs">#{item.id}</span>
                          <StatusBadge status={item.status === 'Processing' ? 'In Progress' : item.status === 'Completed' ? 'Completed' : 'Halted'} />
                        </div>
                        <h3 className="text-[14px] font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-text-primary transition-colors duration-200">{item.name}</h3>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border-primary flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">Time Ingested</span>
                          <span className="text-[12px] font-mono text-text-secondary mt-0.5">{item.timestamp}</span>
                        </div>
                        <button className="text-[11px] font-bold uppercase tracking-wider px-3.5 h-[34px] rounded-lg border border-border-primary text-text-secondary bg-white dark:bg-[#0D1117] hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all font-sans active:scale-95 duration-150 shadow-sm">
                          View
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border-primary px-8 py-4 bg-transparent rounded-b-xl">
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-text-secondary font-medium whitespace-nowrap">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} uploads
                </span>
                <div className="relative">
                  <button className="flex items-center gap-1.5 border border-border-primary px-2.5 h-8 rounded-lg text-[12px] text-text-secondary font-semibold bg-bg-secondary hover:text-text-primary transition-all active:scale-95 duration-150">
                    5 <ChevronDown size={12} className="text-text-tertiary" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-primary bg-bg-secondary text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all active:scale-95 duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <button className="h-8 w-8 rounded-lg bg-text-primary text-bg-primary text-[12px] font-bold shadow-sm transition-all">
                  {currentPage}
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-primary bg-bg-secondary text-text-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated transition-all active:scale-95 duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
