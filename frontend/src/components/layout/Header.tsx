import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, History, ArrowUpRight, User, Settings, LogOut, ChevronDown, Palette, Sun, Moon, Monitor, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../lib/ThemeContext';

interface HeaderProps {
  onLogout: () => void;
  onTabChange?: (tab: string) => void;
  role?: string | null;
}

export default function Header({ onLogout, onTabChange, role }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isStudioUser = role === 'Prompt Manager';
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const themeOptions = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <header className="fixed top-0 left-[84px] right-0 z-40 transition-premium flex h-[76px] items-center justify-between border-b border-border-primary bg-[rgba(255,255,255,.72)] dark:bg-[rgba(5,7,10,.78)] backdrop-blur-[16px] px-8 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
           <h2 className="text-[13px] font-bold tracking-[0.15em] text-text-primary uppercase whitespace-nowrap">PHOTO REAL AI</h2>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-bg-primary dark:bg-bg-secondary rounded-full p-1 border border-border-primary transition-all">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
                    theme === option.id 
                      ? 'bg-white dark:bg-bg-elevated border border-border-primary dark:border-white/5 text-text-primary dark:text-white shadow-sm' 
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                  title={option.label}
                >
                  <option.icon size={14} />
                </button>
              ))}
            </div>

            <button 
              onClick={toggleFullscreen}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-primary bg-white dark:bg-bg-secondary text-text-secondary hover:text-text-primary dark:hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-md"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border-primary bg-white dark:bg-bg-secondary text-text-secondary hover:text-text-primary dark:hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-md">
              <Bell size={16} />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
            </button>
          </div>

          <div className="h-6 w-px bg-border-primary" />
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-transparent hover:bg-neutral-100 dark:hover:bg-bg-elevated transition-all active:scale-95"
            >
              <div className="h-8 w-8 overflow-hidden rounded-lg border border-border-primary shadow-sm">
                <img 
                  src="https://plus.unsplash.com/premium_photo-1690086519096-0594592709d3?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmVtYWxlJTIwYXZhdGFyfGVufDB8fDB8fHww" 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              </div>
              <ChevronDown size={12} className={`text-text-tertiary transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-64 rounded-xl border border-border-primary bg-bg-secondary p-2 shadow-xl z-50"
                >
                  <div className="px-4 py-3 mb-2 border-b border-border-primary">
                    <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Account Manager</p>
                    <p className="text-sm font-bold text-text-primary mt-1 truncate">Sarah Jenkins</p>
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">sarah.j@newera.com</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-wide">
                       <span className="h-1 w-1 rounded-full bg-emerald-500" />
                       Active {role}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        onTabChange?.('design-system');
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-neutral-100 dark:hover:bg-bg-elevated hover:text-text-primary transition-all duration-150"
                    >
                      <Palette size={14} className="text-text-tertiary" />
                      Design Guide
                    </button>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-neutral-100 dark:hover:bg-bg-elevated hover:text-text-primary transition-all duration-150">
                      <User size={14} className="text-text-tertiary" />
                      Workspace Settings
                    </button>
                  </div>

                  <div className="my-2 h-px bg-border-primary" />

                  <button 
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-150 uppercase tracking-widest"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
