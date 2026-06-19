import React from 'react';
import { 
  Type, 
  Palette, 
  Layout, 
  Box, 
  MousePointer2, 
  Layers, 
  ChevronRight, 
  Search, 
  Upload, 
  Check, 
  AlertCircle,
  Bell,
  Settings,
  User,
  ArrowRight,
  History,
  ArrowUpRight,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  LayoutGrid,
  Eye,
  EyeOff,
  RotateCw,
  Cpu,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  BarChart3,
  LayoutDashboard,
  HelpCircle,
  ShieldCheck,
  Activity,
  GalleryVerticalEnd,
  Sparkles,
  Image as ImageIcon,
  SquareStack,
  BarChart,
  Lock,
  UploadCloud,
  Download
} from 'lucide-react';

const COLORS = [
  { name: 'Slate 50', hex: '#f8fafc', class: 'bg-slate-50' },
  { name: 'Slate 100', hex: '#f1f5f9', class: 'bg-slate-100' },
  { name: 'Slate 200', hex: '#e2e8f0', class: 'bg-slate-200' },
  { name: 'Slate 300', hex: '#cbd5e1', class: 'bg-slate-300' },
  { name: 'Slate 400', hex: '#94a3b8', class: 'bg-slate-400' },
  { name: 'Slate 500', hex: '#64748b', class: 'bg-slate-500' },
  { name: 'Slate 600', hex: '#475569', class: 'bg-slate-600' },
  { name: 'Slate 700', hex: '#334155', class: 'bg-slate-700' },
  { name: 'Slate 800', hex: '#1e293b', class: 'bg-slate-800' },
  { name: 'Slate 900', hex: '#0f172a', class: 'bg-slate-900' },
  { name: 'Slate 950', hex: '#020617', class: 'bg-slate-950' },
];

const SEMANTIC_COLORS = [
  { name: 'Emerald (Success)', hex: '#10b981', class: 'bg-emerald-500' },
  { name: 'Amber (Warning)', hex: '#f59e0b', class: 'bg-amber-500' },
  { name: 'Rose (Error)', hex: '#e11d48', class: 'bg-rose-600' },
  { name: 'Blue (Info)', hex: '#3b82f6', class: 'bg-blue-500' },
];

const typography = [
  { label: '3XL - Display', size: '32px', class: 'text-[32px] font-bold tracking-tight' },
  { label: '2XL - Page Heading', size: '28px', class: 'text-[28px] font-bold tracking-tight' },
  { label: 'XL - Section Heading', size: '24px', class: 'text-[24px] font-bold tracking-tight' },
  { label: 'LG - Subheading', size: '20px', class: 'text-[20px] font-bold tracking-tight' },
  { label: 'Base - Body Text', size: '16px', class: 'text-[16px] font-normal' },
  { label: 'SM - Secondary', size: '14px', class: 'text-[14px] font-medium' },
  { label: 'XS - Caption', size: '12px', class: 'text-[12px] font-bold tracking-widest uppercase' },
];

const spacing = [
  { label: 'Space 4', size: '4px', class: 'w-1 h-1' },
  { label: 'Space 8', size: '8px', class: 'w-2 h-2' },
  { label: 'Space 12', size: '12px', class: 'w-3 h-3' },
  { label: 'Space 16', size: '16px', class: 'w-4 h-4' },
  { label: 'Space 24', size: '24px', class: 'w-6 h-6' },
  { label: 'Space 32', size: '32px', class: 'w-8 h-8' },
];

interface DesignSystemProps {
  onBack: () => void;
}

export default function DesignSystem({ onBack }: DesignSystemProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pl-16 peer-hover:pl-48 pt-16 transition-all duration-300">
      <div id="design-system-content" className="max-w-6xl mx-auto px-12 py-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 font-bold text-[12px] tracking-widest uppercase mb-4">
              <Layers size={14} />
              <span>Foundation</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">Design System</h1>
            <p className="mt-4 text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              A comprehensive guide to the visual and functional language powering the Photo Real AI platform.
            </p>
          </div>
          <button 
            onClick={() => {
              window.print();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg text-[12px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm dark:shadow-none"
          >
            <Download size={14} />
            Download
          </button>
        </div>

        <div className="space-y-32">
          {/* Section: Design Tokens */}
          <section id="tokens">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-white/5 pb-4">
              <Palette className="text-slate-900 dark:text-white" size={24} />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Design Tokens</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Neutral Colors (Slate)</h3>
                <div className="space-y-2">
                  {COLORS.map((color) => (
                    <div key={color.name} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-md ${color.class} border border-slate-200 dark:border-white/10`} />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{color.name}</p>
                          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{color.hex}</p>
                        </div>
                      </div>
                      <code className="text-[10px] font-mono bg-slate-50 dark:bg-black px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                        {color.class.replace('bg-', 'slate-')}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <h3 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Semantic Scales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {SEMANTIC_COLORS.map((color) => (
                      <div key={color.name} className="p-4 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none">
                        <div className={`w-full h-12 rounded-md mb-3 ${color.class}`} />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{color.name}</p>
                        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{color.hex}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Spacing System (8px Grid)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {spacing.map((space) => (
                      <div key={space.label} className="p-4 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10 shadow-sm dark:shadow-none flex items-center gap-4">
                        <div className={`bg-slate-900 dark:bg-white rounded-sm ${space.class}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{space.label}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{space.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Typography */}
          <section id="typography">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-white/10 pb-4">
              <Type className="text-slate-900 dark:text-white" size={24} />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Typography Scale</h2>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 p-12 shadow-sm dark:shadow-none overflow-hidden">
              <div className="grid grid-cols-1 gap-12">
                {typography.map((t) => (
                  <div key={t.label} className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                    <div className="md:w-48 shrink-0">
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.label}</p>
                      <p className="text-[10px] font-mono text-slate-300 dark:text-slate-600 mt-1">{t.size} / Geist</p>
                    </div>
                    <p className={`text-slate-900 dark:text-white ${t.class}`}>The quick brown fox jumps over the lazy dog.</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Component States */}
          <section id="states">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-white/10 pb-4">
              <MousePointer2 className="text-slate-900 dark:text-white" size={24} />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Interactive Components</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-12">
                <div>
                  <h3 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Button Variations</h3>
                  <div className="flex flex-col gap-8">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Primary</p>
                      <div className="flex flex-row gap-2">
                        <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-md text-[11px] font-bold tracking-widest uppercase hover:bg-slate-800 dark:hover:bg-slate-200 transition-all">Default</button>
                        <button className="bg-slate-800 dark:bg-slate-200 text-white dark:text-black px-6 py-3 rounded-md text-[11px] font-bold tracking-widest uppercase">Hover State</button>
                        <button className="bg-slate-400 dark:bg-slate-700 text-white dark:text-slate-500 px-6 py-3 rounded-md text-[11px] font-bold tracking-widest uppercase cursor-not-allowed">Disabled</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Secondary</p>
                      <div className="flex flex-row gap-2">
                        <button className="bg-white dark:bg-black border border-slate-200 dark:border-white/20 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-md text-[11px] font-bold tracking-widest uppercase hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Default</button>
                        <button className="bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white px-6 py-3 rounded-md text-[11px] font-bold tracking-widest uppercase underline underline-offset-4">Active State</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Form Fields</h3>
                  <div className="space-y-6 max-w-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Input Default</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                          type="text" 
                          placeholder="Search archives..."
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-white/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest">Error State</label>
                      <div className="relative">
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500" size={14} />
                        <input 
                          type="text" 
                          defaultValue="Invalid Batch ID"
                          className="w-full px-4 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-sm text-rose-900 dark:text-rose-100 focus:outline-none outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Component Library</h3>
                <div className="space-y-6">
                  {/* Card Section */}
                  <div className="p-6 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-md dark:shadow-none">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Metric Card Pattern</span>
                      <Layout size={18} className="text-slate-300 dark:text-slate-700" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">1,248</div>
                    <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <ArrowRight size={12} className="-rotate-45" />
                      12%
                    </div>
                  </div>

                  {/* Icon Grid */}
                  <div className="p-6 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-md dark:shadow-none">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Core Iconography</h4>
                    <div className="grid grid-cols-5 gap-4">
                      {[
                        Search, Bell, Settings, User, Upload, Check, AlertCircle, Layers, Box, MousePointer2,
                        Type, Palette, Layout, History, ArrowUpRight, LogOut, ChevronDown, 
                        Sun, Moon, LayoutGrid, Eye, EyeOff, RotateCw, Cpu, ChevronLeft, 
                        AlertTriangle, Loader2, ChevronRight, ArrowRight,
                        BarChart3, LayoutDashboard, HelpCircle, ShieldCheck, 
                        Activity, GalleryVerticalEnd, Sparkles, ImageIcon,
                        SquareStack, BarChart, Lock, UploadCloud
                      ].map((Icon, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400">
                            <Icon size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Interface Sections */}
          <section id="interface">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-white/10 pb-4">
              <Box className="text-slate-900 dark:text-white" size={24} />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complex Interface Sections</h2>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Navigation Rail</h3>
                <div className="h-16 w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl flex items-center px-4 gap-8 transition-all duration-300">
                  <div className="h-8 w-8 bg-slate-900 dark:bg-white rounded-lg" />
                  <div className="flex gap-4">
                    <div className="h-2 w-12 bg-slate-100 dark:bg-white/5 rounded-full" />
                    <div className="h-2 w-12 bg-slate-100 dark:bg-white/5 rounded-full" />
                    <div className="h-2 w-12 bg-slate-100 dark:bg-white/5 rounded-full" />
                  </div>
                  <div className="ml-auto flex gap-3">
                    <div className="h-8 w-8 bg-slate-50 dark:bg-white/5 rounded-full" />
                    <div className="h-8 w-8 bg-slate-50 dark:bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-32 pt-12 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 pb-16">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-900 dark:bg-white rounded-lg" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Photo Real AI Framework</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Version 1.0.4 • Released May 2026</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm text-center md:text-right">
            Proprietary design guidelines for internal use only. Adherence to these standards is required for all platform developments.
          </p>
        </div>
      </div>
    </div>
  );
}
