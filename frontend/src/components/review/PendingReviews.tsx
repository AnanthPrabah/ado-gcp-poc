import React from 'react';
import { ChevronRight, ArrowRight, Eye, LayoutGrid } from 'lucide-react';
import { Asset } from '../../types';
import { mockAssets } from '../../data';

interface PendingReviewsProps {
  onBack: () => void;
  onReview: (asset: Asset) => void;
}

export default function PendingReviews({ onBack, onReview }: PendingReviewsProps) {
  const pendingAssets = mockAssets.slice(0, 5); // Just using mock assets as examples

  return (
    <main className="h-screen pt-16 pl-16 peer-hover:pl-48 bg-[#F8FAFC] dark:bg-[#0B1521] overflow-y-auto transition-all duration-300">
      <div className="bg-white dark:bg-black px-[48px] py-8 border-b border-slate-100 dark:border-white/10 transition-colors duration-300">
        <div className="w-full">
          <div className="flex items-center gap-2.5 text-[14px] font-medium text-slate-500 mb-4">
            <button onClick={onBack} className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</button>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">Pending Reviews</span>
          </div>
          <h1 className="text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-1">Pending Review</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Review and approve asset generations before final publishing.</p>
        </div>
      </div>

      <div className="px-[48px] py-12">
        <div className="w-full">
          <div className="bg-white dark:bg-black rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] dark:bg-white/5">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Asset</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Details</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-mono text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {pendingAssets.map((asset, index) => (
                    <tr key={index} className="group transition-colors hover:bg-[#F8FAFC]/50 dark:hover:bg-white/[0.02]">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 overflow-hidden rounded border border-slate-200 dark:border-white/10">
                            <img src={asset.imageUrl} alt={asset.title} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-slate-900 dark:text-white">{asset.title.slice(0, 30)}{asset.title.length > 30 ? '...' : ''}</p>
                            <p className="text-[12px] font-mono text-slate-500">ID: PR_{1000 + index}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="rounded-md bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#E11D48] dark:text-rose-400">
                          Pending Review
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[13px] text-slate-600 dark:text-slate-400 font-medium">Requires approval</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => onReview(asset)}
                          className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all hover:bg-slate-800 dark:hover:bg-slate-200 inline-flex items-center gap-2"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-8 py-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between bg-[#F8FAFC]/50 dark:bg-white/5">
               <div className="flex items-center gap-2">
                 <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30" disabled><ChevronRight className="rotate-180" size={18} /></button>
                 <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30" disabled><ChevronRight size={18} /></button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
