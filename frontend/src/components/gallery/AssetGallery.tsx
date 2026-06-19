import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  LayoutGrid, 
  List,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import { mockAssets } from '../../data';
import { Asset, AssetStatus } from '../../types';
import PageShell from '../layout/PageShell';

const ITEMS_PER_PAGE = 8;

interface AssetGalleryProps {
  onAssetClick: (asset: Asset) => void;
  onRefine?: (asset: Asset) => void;
  mode?: 'drafts' | 'recent';
  onBack?: () => void;
}

export default function AssetGallery({ onAssetClick, onRefine, mode = 'drafts', onBack }: AssetGalleryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus[]>(['Published']);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleStatus = (status: AssetStatus) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const filteredAssets = useMemo(() => {
    let results = mockAssets;
    
    if (selectedStatus.length > 0) {
      results = results.filter(asset => selectedStatus.includes(asset.status));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(asset => 
        asset.title.toLowerCase().includes(query) || 
        asset.refId.toLowerCase().includes(query)
      );
    }
    
    return results;
  }, [selectedStatus, searchQuery]);

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const productTypes = [
    'Headwear (Fitted)',
    'Headwear (Snapback)'
  ];

  const leagues = ['NFL', 'MLB', 'NBA'];

  return (
    <>
      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-[84px] top-[76px] z-30 h-[calc(100vh-76px)] w-64 border-r border-border-primary bg-bg-secondary p-6 shadow-sm dark:shadow-none"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xs font-bold tracking-widest text-text-primary uppercase">Filters</h2>
              <button className="text-[10px] font-bold tracking-widest text-text-tertiary hover:text-text-primary uppercase transition-premium">
                Clear All
              </button>
            </div>

            <div className="space-y-8 overflow-y-auto h-[calc(100%-80px)] pr-2 scrollbar-none">
              {/* Product Type */}
              <section>
                <h3 className="mb-4 text-[10px] font-bold tracking-widest text-text-tertiary uppercase">Product Type</h3>
                <div className="space-y-3">
                  {productTypes.map((type) => (
                    <label key={type} className="flex cursor-pointer items-center gap-3 group">
                      <div className={`flex h-4 w-4 items-center justify-center rounded border transition-premium ${type === 'Headwear (Snapback)' ? 'bg-text-primary border-text-primary' : 'border-border-primary bg-bg-primary group-hover:border-text-tertiary'}`}>
                        {type === 'Headwear (Snapback)' && <Check size={10} className="text-bg-primary" />}
                      </div>
                      <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-premium">{type}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* League */}
              <section>
                <h3 className="mb-4 text-[10px] font-bold tracking-widest text-text-tertiary uppercase">League</h3>
                <div className="space-y-3">
                  {leagues.map((league) => (
                    <label key={league} className="flex cursor-pointer items-center gap-3 group">
                      <div className={`flex h-4 w-4 items-center justify-center rounded border transition-premium ${league === 'MLB' ? 'bg-text-primary border-text-primary' : 'border-border-primary bg-bg-primary group-hover:border-text-tertiary'}`}>
                        {league === 'MLB' && <Check size={10} className="text-bg-primary" />}
                      </div>
                      <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-premium">{league}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Season */}
              <section>
                <h3 className="mb-4 text-[10px] font-bold tracking-widest text-text-tertiary uppercase">Season</h3>
                <button className="flex w-full items-center justify-between rounded-lg bg-bg-primary border border-border-primary px-4 py-2 text-xs font-semibold text-text-secondary transition-premium hover:border-text-secondary/40">
                  Fall / Winter 2024
                  <ChevronDown size={14} className="text-text-tertiary" />
                </button>
              </section>

              {/* Approval Status */}
              <section>
                <h3 className="mb-4 text-[10px] font-bold tracking-widest text-text-tertiary uppercase">Approval Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(['Published', 'Draft', 'Review'] as AssetStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`rounded-full border px-3 py-1 text-[9px] font-bold tracking-widest uppercase transition-premium ${
                        selectedStatus.includes(status)
                           ? 'bg-text-primary text-bg-primary border-text-primary'
                          : 'bg-bg-secondary border-border-primary text-text-secondary hover:border-text-secondary/40'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PageShell hasFilter={isFilterOpen} className="h-screen overflow-y-auto">
        {mode === 'recent' && (
          <div className="flex h-12 flex-none items-center border-b border-border-primary bg-bg-secondary px-8">
            <div className="flex items-center gap-2.5 text-xs font-medium text-text-secondary">
              <button onClick={onBack} className="transition-premium hover:text-text-primary font-semibold">Dashboard</button>
              <ChevronRight size={14} className="text-text-tertiary pb-[1px]" />
              <span className="font-bold text-text-primary tracking-tight">Recent Sessions</span>
            </div>
          </div>
        )}
        <div className="py-8 px-8 flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="heading-primary leading-tight mb-1">
                {mode === 'recent' ? 'Recent Sessions' : 'My Drafts'}
              </h1>
              <p className="text-[14px] text-text-secondary font-medium">
                {mode === 'recent' ? 'Review your recently completed generation sessions.' : 'Review and refine your saved asset generations.'}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between border-b border-border-primary pb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-premium active:scale-[0.98] ${
                  isFilterOpen 
                    ? 'border-text-primary bg-text-primary text-bg-primary shadow-sm' 
                    : 'border-border-primary bg-bg-secondary text-text-secondary hover:border-text-secondary/40'
                }`}
              >
                {isFilterOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
                Filters
              </button>

              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-text-primary transition-premium" />
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 w-64 rounded-lg border border-border-primary bg-bg-secondary pl-9 pr-4 text-xs font-semibold text-text-primary placeholder:text-text-tertiary focus:border-text-secondary/40 focus:ring-2 focus:ring-border-primary/50 focus:outline-none transition-premium"
                />
              </div>

              <span className="text-xs font-semibold text-text-tertiary ml-2">
                Showing <span className="font-bold text-text-primary">{filteredAssets.length}</span> generated assets
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-text-tertiary uppercase">Sort By:</span>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-text-primary hover:text-text-secondary transition-premium">
                  Newest Generated
                  <ChevronDown size={12} className="text-text-tertiary" />
                </button>
              </div>
              <div className="h-6 w-px bg-border-primary mx-2" />
              <div className="flex items-center gap-1 rounded-lg bg-bg-elevated border border-border-primary/50 p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-premium ${
                    viewMode === 'grid' 
                      ? 'bg-bg-secondary text-text-primary border border-border-primary shadow-sm' 
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  <LayoutGrid size={14} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-premium ${
                    viewMode === 'list' 
                      ? 'bg-bg-secondary text-text-primary border border-border-primary shadow-sm' 
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Asset Grid/List */}
          <div className={`${
            viewMode === 'grid' 
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "flex flex-col gap-3"
            } min-h-[600px]`}
          >
            {paginatedAssets.map((asset) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={asset.id} 
                onClick={() => onAssetClick(asset)}
                className={
                  viewMode === 'grid' 
                    ? "group premium-card p-3 flex flex-col cursor-pointer transition-premium"
                    : "group relative flex rounded-xl bg-bg-secondary transition-premium hover:border-text-secondary/40 cursor-pointer border border-border-primary flex-row items-center p-3 px-6 gap-8 shadow-sm dark:shadow-none"
                }
              >
                {/* Status Badge floating on Grid, or inline on List */}
                {viewMode === 'grid' ? (
                  <div className="relative aspect-square overflow-hidden rounded-[12px] bg-bg-primary border border-border-primary/50 mb-3 shrink-0">
                    <img 
                      src={asset.imageUrl} 
                      alt={asset.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 bg-bg-secondary/80 backdrop-blur border border-border-primary/50 px-2 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-wider shadow-sm z-10">
                      <span className={
                        mode === 'drafts' ? 'text-text-secondary' :
                        asset.status === 'Published' ? 'text-emerald-500' : 
                        asset.status === 'Draft' ? 'text-text-secondary' : 'text-amber-500'
                      }>
                        {mode === 'drafts' ? 'Draft' : (asset.status === 'Published' ? 'Approved' : asset.status)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-24 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                        mode === 'drafts' ? 'bg-bg-primary border-border-primary text-text-secondary' :
                        asset.status === 'Published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                        asset.status === 'Draft' ? 'bg-bg-primary border-border-primary text-text-secondary' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          mode === 'drafts' ? 'bg-text-tertiary' :
                          asset.status === 'Published' ? 'bg-emerald-500' : 
                          asset.status === 'Draft' ? 'bg-text-tertiary' : 'bg-amber-500'
                        }`} />
                        {mode === 'drafts' ? 'Draft' : (asset.status === 'Published' ? 'Approved' : asset.status)}
                      </span>
                    </div>

                    <div className="h-14 w-14 overflow-hidden bg-bg-primary rounded-lg border border-border-primary/50 relative shrink-0">
                      <img 
                        src={asset.imageUrl} 
                        alt={asset.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                    </div>
                  </>
                )}
 
                {/* Content */}
                {viewMode === 'grid' ? (
                  <div className="flex flex-col mt-auto">
                    <div className="px-1 py-1 flex items-center justify-between">
                      <p className="text-xs font-bold text-text-primary truncate pr-2">{asset.title}</p>
                      <p className="text-[10px] font-mono text-text-tertiary font-semibold shrink-0">{asset.version || 'v2.4'}</p>
                    </div>
                    <div className="px-1 pb-1 flex justify-between items-center text-[10px] font-semibold text-text-tertiary">
                      <span>SKU: {asset.refId}</span>
                      <span className="uppercase tracking-wider text-[9px] font-bold text-text-tertiary">{asset.tags[0]}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 grid grid-cols-4 items-center gap-8">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary tracking-tight leading-tight group-hover:text-text-primary transition-all pr-2 truncate">
                        {asset.title}
                      </h3>
                    </div>
                    
                    <div className="text-xs font-mono font-semibold text-text-tertiary">
                      ID: <span className="text-text-secondary">{asset.refId}</span>
                    </div>

                    <div className="text-xs font-semibold text-text-tertiary">
                      VERSION: <span className="text-text-secondary">{asset.version || 'v2.4'}</span>
                    </div>

                    <div className="flex justify-end pr-4">
                      <div className="flex gap-2">
                        {asset.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded-[4px] border border-border-primary bg-bg-primary/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-text-secondary font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 pb-12">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary bg-bg-secondary text-text-secondary transition-premium hover:border-text-secondary/40 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 rounded-lg text-xs font-bold transition-premium ${
                      currentPage === page
                        ? 'bg-text-primary text-bg-primary border border-text-primary shadow-sm'
                        : 'border border-transparent text-text-tertiary hover:border-border-primary hover:bg-bg-secondary hover:text-text-primary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary bg-bg-secondary text-text-secondary transition-premium hover:border-text-secondary/40 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Empty Counter/Status */}
          {filteredAssets.length === 0 && (
            <div className="mt-20 flex flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-bg-secondary border border-border-primary p-4 shadow-sm">
                <LayoutGrid size={32} className="text-text-tertiary" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">No assets found</h3>
              <p className="text-xs text-text-tertiary mt-1">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </PageShell>
    </>
  );
}
