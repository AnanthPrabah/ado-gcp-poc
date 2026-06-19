import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Image as ImageIcon, 
  Clock, 
  Zap, 
  Trash2, 
  PenTool, 
  Mic, 
  Plus, 
  Send,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Upload,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatorImages, generatorTimeline, generatorMessages } from '../../data';

interface AssetGeneratorProps {
  onBack: () => void;
  initialPrompt?: string;
}

export default function AssetGenerator({ onBack, initialPrompt }: AssetGeneratorProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [messages, setMessages] = useState(generatorMessages(initialPrompt));

  const generations = generatorImages;

  const timeline = generatorTimeline;

  return (
    <div className="min-h-screen bg-slate-100 pl-16 peer-hover:pl-48 pt-16">
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Combined Fixed Header Panel */}
        <div className="flex items-center w-full border-b border-slate-100 bg-white z-20">
          {/* Left Header Section */}
          <div className="flex-1 flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 hover:text-slate-900 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <ImageIcon size={24} className="text-slate-900" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Active Generations</h1>
              </div>
            </div>

            {/* Version Timeline */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 mr-4">
                {timeline.slice(0, 4).map((item, idx) => (
                  <div key={idx} className={`h-10 w-10 overflow-hidden rounded-full border-2 ${idx === 0 ? 'border-[#E11D48]' : 'border-white'} relative cursor-pointer shadow-sm z-[${10 - idx}]`}>
                    <img src={(item.image as any)?.src || item.image} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white tracking-tight">{item.version}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Clock size={16} className="text-slate-400" />
                Version History
              </button>
            </div>
          </div>

          {/* Right Header Section (Actions) */}
          <div className="w-[520px] px-8 py-4">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center rounded-lg border border-slate-200 bg-white h-10 text-[11px] font-bold tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase active:scale-[0.98] shadow-sm">
                Save as Draft
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg bg-black h-10 text-[11px] font-bold tracking-widest text-white uppercase shadow-xl shadow-black/10 hover:bg-slate-800 transition-all active:scale-[0.98]">
                Publish Prompt
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-y-auto px-8 py-10 custom-scrollbar">
            {/* Single Featured Image */}
            <div className="flex justify-center mb-10 max-w-5xl">
              <div className="group relative aspect-square w-full max-w-xl overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                <img src={(generations[1] as any)?.src || generations[1]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="flex items-center gap-1.5 rounded bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-slate-400 shadow-sm uppercase tracking-wider">
                    <RefreshCw size={10} /> 1024x1024
                  </div>
                </div>
                <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 size={16} />
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#E11D48]/30 transition-all pointer-events-none" />
              </div>
            </div>

            {/* Lighting Styles */}
            <div className="max-w-5xl rounded-xl border border-[#FFE4E4] bg-[#FFF9F9] p-8 mt-auto box-border">
              <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-6 opacity-80">Lighting Styles</h3>
              <div className="flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-3 rounded-lg border border-[#E11D48]/30 bg-[#FFE4E4] px-6 py-4 text-[14px] font-bold text-[#E11D48] shadow-sm">
                  <ImageIcon size={18} /> Cinematic
                </button>
                <button className="flex-1 flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-4 text-[14px] font-bold text-slate-800 hover:bg-slate-50 transition-all">
                  <Zap size={18} /> Studio
                </button>
                <button className="flex-1 flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-4 text-[14px] font-bold text-slate-800 hover:bg-slate-50 transition-all">
                  <ImageIcon size={18} /> Catalog
                </button>
                <button className="flex-1 flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-4 text-[14px] font-bold text-slate-800 hover:bg-slate-50 transition-all">
                  <PenTool size={18} /> Vector
                </button>
              </div>
            </div>
          </div>

          <div className="w-[520px] flex flex-col border-l border-slate-100 bg-white">
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col">
              {/* AI Chat Interface */}
              <div className="flex-1 flex flex-col gap-8 pb-8">
                <div className="mb-4">
                  <h3 className="text-[14px] font-bold text-slate-900 mb-2 font-sans">AI Workspace</h3>
                  <p className="text-[12px] text-slate-400 leading-relaxed italic">Refine your concepts through natural conversation with the Gen-AI Agent.</p>
                </div>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {msg.role === 'assistant' ? (
                        <>
                          <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center">
                            <Sparkles size={12} className="text-white" />
                          </div>
                          <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">Gen-AI Agent</span>
                        </>
                      ) : (
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">You</span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                    </div>
                    <div className={`max-w-[90%] rounded-2xl p-6 text-[15px] leading-relaxed font-sans shadow-sm border ${
                      msg.role === 'user' 
                        ? 'bg-white border-slate-100 text-slate-700' 
                        : 'bg-slate-900 border-slate-800 text-white'
                    }`}>
                      {msg.content}
                      {msg.version && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Generated {msg.version}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          {/* Bottom Action */}
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            {/* Refinement Area */}
            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm flex flex-col gap-2">
               <textarea 
                  placeholder="What would you like to change or create?"
                  className="w-full bg-transparent text-[14px] font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none resize-none h-5 scrollbar-hide overflow-hidden"
                />
                <div className="flex items-center justify-end gap-5 text-slate-400">
                  <button className="hover:text-slate-900 transition-all p-1">
                    <Mic size={18} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setIsUploadOpen(!isUploadOpen)}
                      className="hover:text-slate-900 transition-all p-1"
                    >
                      <Plus size={18} />
                    </button>
                    <AnimatePresence>
                      {isUploadOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full right-0 mb-3 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-2xl z-50 overflow-hidden"
                        >
                          <button 
                            onClick={() => setIsUploadOpen(false)}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-left"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                              <Upload size={16} />
                            </div>
                            Upload Files
                          </button>
                          <button 
                            onClick={() => setIsUploadOpen(false)}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-left"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                              <Package size={16} />
                            </div>
                            Upload Tech Pack
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button className="hover:text-slate-900 transition-all p-1"><Send size={18} className="fill-slate-400" /></button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
