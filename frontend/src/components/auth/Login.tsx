import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Eye, EyeOff, ArrowRight, ChevronDown, Check, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { ROLES } from '../../data';

import logo from '../../assets/images/regenerated_image_1778569144247.png';
import bgImage from '../../assets/images/login-bg.jpg';

interface LoginProps {
  onLogin: (role: string) => void;
}

// ROLES imported from central data module

export default function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(ROLES[0].username);
  const [password, setPassword] = useState(ROLES[0].password);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const handleRoleSelect = (role: typeof ROLES[0]) => {
    setSelectedRole(role);
    setUsername(role.username);
    setPassword(role.password);
    setIsDropdownOpen(false);
  };

  const handleSSOLogin = (provider: string) => {
    setIsAuthenticating(true);
    setAuthProvider(provider);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin(selectedRole.id);
    }, 1500);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole.id);
  };

  const themeOptions = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-[#030303] p-8 transition-colors duration-300">
      <img src={typeof bgImage === 'object' && bgImage !== null && 'src' in bgImage ? (bgImage as any).src : bgImage} className="absolute inset-0 h-full w-full object-cover object-top" alt="Background" />
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="absolute top-8 right-8 flex items-center bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/20 transition-all z-50">
        {themeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setTheme(option.id)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all ${
              theme === option.id 
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                : 'text-white/60 hover:text-white'
            }`}
            title={option.label}
          >
            <option.icon size={18} />
          </button>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-lg border border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/40 backdrop-blur-3xl backdrop-saturate-150 p-8 shadow-xl shadow-black/10 dark:shadow-none"
          >
            {isAuthenticating && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-white transition-opacity duration-300">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-200">Signing in with {authProvider}...</p>
              </div>
            )}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden">
                <img 
                  src={typeof logo === 'object' && logo !== null && 'src' in logo ? (logo as any).src : logo} 
                  alt="New Era" 
                  className="h-full w-full object-contain filter dark:invert"
                />
              </div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-300">Photo Real Platform</h3>
            </div>

            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Sign In</h2>
            </div>

            <div className="relative mb-4" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 text-sm transition-all hover:bg-white/80 dark:hover:bg-white/10 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/10">
                    <img 
                      src={typeof logo === 'object' && logo !== null && 'src' in logo ? (logo as any).src : logo} 
                      alt="Role" 
                      className="h-4 w-4 object-contain filter dark:invert"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Workspace Role</span>
                    <span className="block font-semibold text-slate-900 dark:text-white">{selectedRole.label}</span>
                  </div>
                </div>
                <ChevronDown className={`text-slate-700 dark:text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-50 mt-2 w-full rounded-md border border-white/40 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/10 dark:shadow-black/50"
                  >
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role)}
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm transition-all ${
                          selectedRole.id === role.id 
                            ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white font-bold' 
                            : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {role.label}
                        {selectedRole.id === role.id && <Check size={16} className="text-emerald-500" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="ID / Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-4 text-sm transition-all focus:border-white/80 dark:focus:border-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 dark:focus:ring-white/5 text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-400 backdrop-blur-md"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-4 text-sm transition-all focus:border-white/80 dark:focus:border-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 dark:focus:ring-white/5 text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-400 backdrop-blur-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-black dark:bg-white py-4 text-sm font-bold tracking-widest text-white dark:text-black transition-all hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg shadow-black/10 dark:shadow-none active:scale-[0.98] uppercase"
              >
                Login
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/20 dark:border-white/10"></div>
              </div>
              <span className="relative px-3 bg-transparent text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-400">
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleSSOLogin('Microsoft')}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 py-4 text-sm font-semibold transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99] group cursor-pointer text-slate-800 dark:text-slate-200"
              title="Sign in with Microsoft"
            >
              <MicrosoftIcon className="h-5 w-5" />
              <span>Sign in with Microsoft</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Brand SVG Icons for SSO Providers
const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 23 23" {...props}>
    <rect x="0" y="0" width="11" height="11" fill="#F25022" />
    <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
    <rect x="0" y="12" width="11" height="11" fill="#00A4EF" />
    <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
  </svg>
);
