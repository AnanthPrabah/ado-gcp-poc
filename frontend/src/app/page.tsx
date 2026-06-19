"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import Login from '../components/auth/Login';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Dashboard from '../components/dashboard/Dashboard';
import StudioDashboard from '../components/dashboard/StudioDashboard';
import AssetGallery from '../components/gallery/AssetGallery';
import AssetDetail from '../components/gallery/AssetDetail';
import PendingReviews from '../components/review/PendingReviews';
import AssetGenerator from '../components/generator/AssetGenerator';
import UploadCenter from '../components/generator/UploadCenter';
import IngestionReview from '../components/review/IngestionReview';
import BatchOrchestration from '../components/batch/BatchOrchestration';
import BatchManagerModule from '../components/batch/BatchManagerModule';
import DesignSystem from '../components/DesignSystem';
import StudioUploadModule from '../components/generator/StudioUploadModule';
import HeadlessIngestion from '../components/review/HeadlessIngestion';
import { Asset } from '../types';

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [initialGeneratorPrompt, setInitialGeneratorPrompt] = useState<string | undefined>();
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [hasNewDraft, setHasNewDraft] = useState(false);
  const [globalToast, setGlobalToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

  React.useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'info' | 'error' | 'warning' }>;
      if (customEvent.detail) {
        setGlobalToast(customEvent.detail);
      }
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  React.useEffect(() => {
    if (globalToast) {
      const timer = setTimeout(() => setGlobalToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [globalToast]);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (isReviewing) {
      url.searchParams.set('view', 'review');
    } else if (selectedAsset) {
      url.searchParams.set('view', 'asset-detail');
    } else if (isGenerating) {
      url.searchParams.set('view', 'generate');
    } else {
      url.searchParams.set('view', activeTab);
    }
    window.history.replaceState({}, '', url);
  }, [activeTab, isReviewing, selectedAsset, isGenerating]);

  const handleLogin = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === 'Batch Manager') {
      setActiveTab('manager-dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setSelectedAsset(null);
    setActiveTab('dashboard');
    setIsGenerating(false);
    setIsReviewing(false);
  };

  const isPromptManager = userRole === 'Prompt Manager';
  const isCreativeUser = userRole === 'Creative User';
  const isBatchManager = userRole === 'Batch Manager';

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const handleStartGeneration = (prompt?: string) => {
    setInitialGeneratorPrompt(prompt);
    setIsGenerating(true);
  };

  const renderContent = () => {
    if (selectedAsset) {
      return (
        <AssetDetail 
          asset={selectedAsset} 
          onBack={() => setSelectedAsset(null)} 
          role={userRole}
          activeTab={activeTab}
        />
      );
    }

    if (isReviewing) {
      return (
        <IngestionReview 
          onBack={() => {
            setIsReviewing(false);
            setActiveTab('studio-upload');
          }} 
          onSaveAsDraft={() => {
            setIsReviewing(false);
            setHasNewDraft(true);
            setShowDraftToast(true);
            setTimeout(() => setShowDraftToast(false), 3000);
            setActiveTab('dashboard');
          }}
          onApprove={() => {
            setIsReviewing(false);
            setActiveTab('dashboard');
          }}
        />
      );
    }

    if (isGenerating || activeTab === 'generate') {
      return (
        <AssetGenerator 
          onBack={() => {
            setIsGenerating(false);
            if (activeTab === 'generate') setActiveTab('dashboard');
          }} 
          initialPrompt={initialGeneratorPrompt}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return isPromptManager || isCreativeUser ? (
          <StudioDashboard 
            onGenerate={() => handleStartGeneration()} 
            onAssetClick={setSelectedAsset}
            onTabChange={setActiveTab}
            onReview={() => setIsReviewing(true)}
            role={userRole}
            hasNewDraft={hasNewDraft}
          />
        ) : (
          <Dashboard 
            onAssetClick={setSelectedAsset} 
            onReview={() => setIsReviewing(true)}
          />
        );
      case 'upload':
        return <UploadCenter onGenerate={handleStartGeneration} onReview={() => setIsReviewing(true)} />;
      case 'studio-upload':
        return <StudioUploadModule onReview={() => setIsReviewing(true)} onAssetClick={setSelectedAsset} />;
      case 'batch':
        return <BatchOrchestration initialView="main" onTabChange={setActiveTab} role={userRole} />;
      case 'batch-detail':
        return <BatchOrchestration initialView="detail" onTabChange={setActiveTab} role={userRole} />;
      case 'exceptions':
        return <BatchOrchestration initialView="exceptions" onTabChange={setActiveTab} role={userRole} />;
      case 'presets':
        return <BatchOrchestration initialView="presets" onTabChange={setActiveTab} role={userRole} />;
      case 'manager-dashboard':
        return <BatchManagerModule initialTab="manager-dashboard" onTabChange={setActiveTab} />;
      case 'manager-batches':
        return <BatchManagerModule initialTab="manager-batches" onTabChange={setActiveTab} />;
      case 'manager-exceptions':
        return <BatchManagerModule initialTab="manager-exceptions" onTabChange={setActiveTab} />;
      case 'manager-presets':
        return <BatchManagerModule initialTab="manager-presets" onTabChange={setActiveTab} />;
      case 'notifications':
        return <BatchManagerModule initialTab="notifications" onTabChange={setActiveTab} />;
      case 'recent':
        return (
          <AssetGallery 
            mode="recent"
            onBack={() => setActiveTab('dashboard')}
            onAssetClick={(asset) => {
              setSelectedAsset(null);
              setIsReviewing(true);
            }} 
            onRefine={(asset) => {
              setSelectedAsset(null); 
              setIsReviewing(true);   
            }}
          />
        );
      case 'pending-reviews':
        return (
          <PendingReviews 
            onBack={() => setActiveTab('dashboard')}
            onReview={() => setIsReviewing(true)}
          />
        );
      case 'gallery':
        return (
          <AssetGallery 
            onAssetClick={(asset) => {
              setSelectedAsset(null);
              setIsReviewing(true);
            }} 
            onRefine={(asset) => {
              setSelectedAsset(null); // Ensure no detail view is open
              setIsReviewing(true);   // Open multi-angle preview
            }}
          />
        );
      case 'design-system':
        return <DesignSystem onBack={() => setActiveTab('dashboard')} />;
      case 'headless':
        return <HeadlessIngestion />;
      default:
        return <AssetGallery onAssetClick={setSelectedAsset} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary dark:bg-bg-primary transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedAsset(null);
          setIsGenerating(false);
          setIsReviewing(false);
        }} 
        role={userRole}
      />
      <Header onLogout={handleLogout} onTabChange={setActiveTab} role={userRole} />
      
      {renderContent()}

      {showDraftToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-lg shadow-black/20 text-[14px] font-medium tracking-wide flex items-center gap-3 border dark:border-white/10">
            <div className="h-5 w-5 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            Render has been saved as draft
          </div>
        </div>
      )}

      <AnimatePresence>
        {globalToast && (
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed top-6 right-6 z-[200] pointer-events-auto"
          >
            <div className="w-[340px] overflow-hidden rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.08] shadow-[0_12px_38px_-4px_rgba(0,0,0,0.08),0_4px_16px_-2px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_38px_-4px_rgba(0,0,0,0.5),0_4px_16px_-2px_rgba(0,0,0,0.3)] flex items-stretch relative select-none">
              {/* Colored status bar on the far left */}
              <div className={`w-[4px] shrink-0 ${
                globalToast.type === 'success'
                  ? 'bg-emerald-500'
                  : globalToast.type === 'warning'
                  ? 'bg-amber-500'
                  : globalToast.type === 'error'
                  ? 'bg-rose-500'
                  : 'bg-blue-500'
              }`} />

              <div className="flex-1 p-4 flex gap-3.5 items-start">
                {/* Circular Icon Container */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  globalToast.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : globalToast.type === 'warning'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : globalToast.type === 'error'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}>
                  {globalToast.type === 'success' && <CheckCircle2 size={16} strokeWidth={2.5} />}
                  {globalToast.type === 'warning' && <AlertTriangle size={16} strokeWidth={2.5} />}
                  {globalToast.type === 'error' && <AlertCircle size={16} strokeWidth={2.5} />}
                  {globalToast.type === 'info' && <Info size={16} strokeWidth={2.5} />}
                </div>

                {/* Content text */}
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      globalToast.type === 'success'
                        ? 'text-emerald-500'
                        : globalToast.type === 'warning'
                        ? 'text-amber-500'
                        : globalToast.type === 'error'
                        ? 'text-rose-500'
                        : 'text-blue-500'
                    }`}>
                      {globalToast.type}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-[9px] font-semibold font-mono text-text-tertiary">
                      Just now
                    </span>
                  </div>
                  <h4 className="text-[13px] font-bold text-text-primary leading-tight mt-1">
                    {globalToast.type === 'success' 
                      ? 'Process Completed' 
                      : globalToast.type === 'warning' 
                      ? 'Process Cancelled' 
                      : globalToast.type === 'error' 
                      ? 'Process Error' 
                      : 'System Notice'}
                  </h4>
                  <p className="font-sans text-[12px] text-text-secondary mt-1.5 leading-relaxed font-medium">
                    {globalToast.message}
                  </p>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => setGlobalToast(null)}
                className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
