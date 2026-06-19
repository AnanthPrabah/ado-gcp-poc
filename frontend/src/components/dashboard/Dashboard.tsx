import React from 'react';
import PageShell from '../layout/PageShell';
import { 
  Box,
  Activity,
  Layers,
  TrendingUp,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  ArrowUpRight
} from 'lucide-react';
import { mockAssets, statsMenuItems, recentSessions as rawRecentSessions, draftGens as rawDraftGens, pendingReviewItems as rawPendingReviewItems } from '../../data';
import { Asset } from '../../types';

interface DashboardProps {
  onAssetClick: (asset: Asset) => void;
  onReview: () => void;
}

export default function Dashboard({ onAssetClick, onReview }: DashboardProps) {
  const recentSessions = rawRecentSessions.map((session, i) => {
    if (i === 0) return { ...session, img: mockAssets[0]?.imageUrl };
    if (i === 1) return { ...session, img: mockAssets[1]?.imageUrl };
    if (i === 2) return { ...session, img: mockAssets[4]?.imageUrl };
    return session;
  });

  const draftGens = rawDraftGens.map((draft, i) => {
    if (i === 0) return { ...draft, img: mockAssets[6]?.imageUrl };
    if (i === 1) return { ...draft, img: mockAssets[7]?.imageUrl };
    return draft;
  });

  const pendingReviewItems = rawPendingReviewItems.map((item, i) => {
    if (i === 0) return { ...item, img: mockAssets[8]?.imageUrl };
    if (i === 1) return { ...item, img: mockAssets[9]?.imageUrl };
    return item;
  });

  return (
    <PageShell>
      <div className="w-full py-8 px-8">
        {/* Header Area */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="heading-primary mb-1">Hello, Creative User.</h1>
            <p className="text-[14px] text-text-secondary font-medium mt-1 font-sans">Your AI-assisted creation space is ready.</p>
          </div>
          <button className="btn-upload active:scale-95 shadow-sm">
            <Box size={13} /> GET STARTED <ChevronDown size={13} />
          </button>
        </div>

      {/* Top Stats Grid */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsMenuItems.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="premium-card h-[128px] p-5 flex flex-col justify-between cursor-default">
              <div className="flex items-start justify-between">
                <div className="text-text-tertiary">
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <div className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100/50 dark:border-emerald-500/20">
                  <ArrowUpRight size={10} strokeWidth={2.5} className="mr-0.5" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (Main Content) */}
        <div className="col-span-2 space-y-8">
          {/* Recent Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h2 className="heading-section mb-0">Recent Sessions</h2>
               <button className="text-[10px] font-bold text-text-tertiary hover:text-text-primary uppercase tracking-widest transition-premium">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {recentSessions.map((session, idx) => (
                  <div key={idx} className="premium-card p-3 flex flex-col cursor-pointer transition-premium">
                    <div className="relative rounded-lg bg-neutral-50 dark:bg-white/5 border border-border-primary/50 h-48 flex items-center justify-center p-4 overflow-hidden">
                      <img src={(session.img as any)?.src || session.img || ''} className="object-contain h-full w-full transition-transform duration-500 hover:scale-102" alt={session.title} />
                      <div className="absolute top-2 right-2 bg-bg-secondary/80 backdrop-blur border border-border-primary px-2 py-0.5 rounded text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                        {session.tag}
                      </div>
                    </div>
                    <div className="px-1 py-3 mt-auto">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500/80 shrink-0" />
                        <p className="text-xs font-bold text-text-primary truncate">{session.title}</p>
                      </div>
                      <p className="text-[10px] text-text-tertiary pl-3 font-semibold uppercase tracking-wider">{session.variations}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Draft Generations */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h2 className="heading-section mb-0">Draft Generations</h2>
               <button className="text-[10px] font-bold text-text-tertiary hover:text-text-primary uppercase tracking-widest transition-premium">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {draftGens.map((draft, idx) => (
                  <div 
                    key={idx} 
                    onClick={onReview}
                    className="premium-card p-3 flex flex-col cursor-pointer transition-premium"
                  >
                    <div className="relative rounded-lg bg-neutral-50 dark:bg-white/5 border border-border-primary/50 h-56 flex items-center justify-center p-4 overflow-hidden"
                    >
                      <img src={(draft.img as any)?.src || draft.img || ''} className="object-cover h-full w-full rounded transition-transform duration-500 hover:scale-102" alt={draft.title} />
                      <div className="absolute top-2 right-2 bg-bg-secondary/80 backdrop-blur border border-border-primary px-2 py-0.5 rounded text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                        DRAFT
                      </div>
                    </div>
                    <div className="px-1 py-3 mt-auto flex items-center justify-between">
                      <p className="text-xs font-bold text-text-primary truncate pr-2">{draft.title}</p>
                      <p className="text-[10px] font-mono text-text-tertiary font-semibold shrink-0">{draft.version}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Pending Review */}
          <div className="premium-card p-5">
               <div className="flex items-center justify-between mb-6">
                   <h2 className="heading-section">Pending Review</h2>
                   <button className="text-[10px] font-bold text-text-tertiary hover:text-text-primary uppercase tracking-widest transition-premium">View All</button>
               </div>
               <div className="space-y-4">
                   {pendingReviewItems.map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between group cursor-pointer p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-white/5 transition-premium duration-150">
                         <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded border border-border-primary bg-neutral-50 dark:bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                   <img src={(item.img as any)?.src || item.img || ''} className="h-full w-full object-cover" alt={item.title} />
                              </div>
                              <div>
                                   <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">{item.title}</p>
                                   <p className="text-[10px] text-text-tertiary mt-0.5 font-semibold uppercase tracking-wider">{item.subtitle}</p>
                              </div>
                         </div>
                         <ChevronRight size={14} className="text-text-tertiary/60 group-hover:text-text-primary transition-colors transform translate-x-0 group-hover:translate-x-0.5 duration-200" />
                     </div>
                   ))}
               </div>
          </div>

          {/* AI Insights */}
          <div className="premium-card p-5">
               <div className="flex items-center gap-2 mb-6">
                   <Lightbulb className="text-rose-500/90" size={16} strokeWidth={2} />
                   <h2 className="heading-section">AI Insights</h2>
               </div>
               <div className="space-y-3">
                   <div className="rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 p-4 flex items-start gap-3 transition-premium">
                       <div className="h-2 w-2 rounded-full bg-emerald-500/80 mt-1.5 shrink-0" />
                       <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400/90 leading-relaxed">Your recent prompts are yielding high-confidence results.</p>
                   </div>
                   <div className="rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 p-4 flex items-start gap-3 transition-premium">
                       <div className="h-2 w-2 rounded-full bg-amber-500/80 mt-1.5 shrink-0" />
                       <p className="text-xs font-medium text-amber-800 dark:text-amber-400/90 leading-relaxed">Refining recent drafts improved model inference by 18%.</p>
                   </div>
               </div>
          </div>
        </div>
      </div>
      </div>
    </PageShell>
  );
}

