import logo from '../../assets/images/regenerated_image_1778569144247.png';

import BatchUploadIcon from '../ui/icons/BatchUploadIcon';

import {
  BarChart3,
  LayoutDashboard,
  HelpCircle,
  ShieldCheck,
  Activity,
  Palette,
  Layers,
  History,
  Bell,
  GalleryVerticalEnd,
  Sparkles,
  Image as ImageIcon,
  SquareStack,
  BarChart,
  Settings,
  Lock,
  UploadCloud,
  Cpu,
  MessageCircle,
  LayoutGrid
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role?: string | null;
}

export default function Sidebar({ activeTab, onTabChange, role }: SidebarProps) {
  const isPromptManager = role === 'Prompt Manager';
  const isCreativeUser = role === 'Creative User';
  const isBatchOperator = role === 'Batch Operator';
  const isBatchManager = role === 'Batch Manager';

  let menuItems = [
    { icon: <LayoutDashboard size={20} strokeWidth={1.8} />, id: 'dashboard', label: 'DASHBOARD' },
    { icon: <UploadCloud size={20} strokeWidth={1.8} />, id: 'studio-upload', label: 'MY STUDIO' },
    { icon: <BatchUploadIcon size={20} />, id: 'batch', label: 'BATCHES' },
    { icon: <GalleryVerticalEnd size={20} strokeWidth={1.8} />, id: 'gallery', label: 'GALLERY' },
    { icon: <Cpu size={20} strokeWidth={1.8} />, id: 'headless', label: 'HEADLESS' },
  ];

  if (isPromptManager) {
    menuItems = [
      { icon: <Sparkles size={20} strokeWidth={1.8} />, id: 'dashboard', label: 'CREATE' },
      { icon: <UploadCloud size={20} strokeWidth={1.8} />, id: 'studio-upload', label: 'MY STUDIO' },
      { icon: <ImageIcon size={20} strokeWidth={1.8} />, id: 'gallery', label: 'ASSETS' },
      { icon: <SquareStack size={20} strokeWidth={1.8} />, id: 'templates', label: 'TEMPLATES' },
      { icon: <BarChart size={20} strokeWidth={1.8} />, id: 'analytics', label: 'ANALYTICS' },
      { icon: <Settings size={20} strokeWidth={1.8} />, id: 'settings', label: 'CONFIG' },
      { icon: <Cpu size={20} strokeWidth={1.8} />, id: 'headless', label: 'HEADLESS' },
    ];
  } else if (isCreativeUser) {
    menuItems = [
      { icon: <LayoutDashboard size={20} strokeWidth={1.8} />, id: 'dashboard', label: 'OVERVIEW' },
      { icon: <UploadCloud size={20} strokeWidth={1.8} />, id: 'studio-upload', label: 'STUDIO' },
      { icon: <Layers size={20} strokeWidth={1.8} />, id: 'batch', label: 'BATCHES' },
      { icon: <Cpu size={20} strokeWidth={1.8} />, id: 'headless', label: 'HEADLESS' },
      { icon: <GalleryVerticalEnd size={20} strokeWidth={1.8} />, id: 'gallery', label: 'DRAFTS' },
    ];
  } else if (isBatchOperator) {
    menuItems = [
      { icon: <Activity size={20} strokeWidth={1.8} />, id: 'batch', label: 'DASHBOARD' },
      { icon: <UploadCloud size={20} strokeWidth={1.8} />, id: 'studio-upload', label: 'MY STUDIO' },
      { icon: <Layers size={20} strokeWidth={1.8} />, id: 'exceptions', label: 'EXCEPTIONS' },
      { icon: <Settings size={20} strokeWidth={1.8} />, id: 'presets', label: 'PRESETS' },
      { icon: <History size={20} strokeWidth={1.8} />, id: 'history', label: 'LOGS' },
      { icon: <Cpu size={20} strokeWidth={1.8} />, id: 'headless', label: 'HEADLESS' },
    ];
  } else if (isBatchManager) {
    menuItems = [
      { icon: <LayoutDashboard size={20} strokeWidth={1.8} />, id: 'manager-dashboard', label: 'DASHBOARD' },
      { icon: <UploadCloud size={20} strokeWidth={1.8} />, id: 'studio-upload', label: 'MY STUDIO' },
      { icon: <SquareStack size={20} strokeWidth={1.8} />, id: 'manager-batches', label: 'BATCHES' },
      { icon: <Layers size={20} strokeWidth={1.8} />, id: 'manager-exceptions', label: 'EXCEPTIONS' },
      { icon: <Settings size={20} strokeWidth={1.8} />, id: 'manager-presets', label: 'PRESETS' },
      { icon: <Bell size={20} strokeWidth={1.8} />, id: 'notifications', label: 'NOTIFICATIONS' },
      { icon: <Cpu size={20} strokeWidth={1.8} />, id: 'headless', label: 'HEADLESS' },
      { icon: <GalleryVerticalEnd size={20} strokeWidth={1.8} />, id: 'gallery', label: 'DRAFTS' },
    ];
  }

  return (
    <div className="fixed left-0 top-0 flex h-full w-[84px] flex-col items-center justify-between py-4 z-50 transition-premium sidebar-bg">
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => {
              if (isBatchOperator) {
                onTabChange('batch');
              } else if (isBatchManager) {
                onTabChange('manager-dashboard');
              } else {
                onTabChange('dashboard');
              }
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl p-2 transition-premium hover:opacity-80 active:scale-95"
          >
            <img
              src={(logo as any)?.src || logo}
              alt="New Era"
              className="h-full w-full object-contain dark:invert transition-premium"
            />
          </button>

        </div>
        <div className="flex w-full flex-col items-center gap-3 px-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                }}
                className={`flex w-full flex-col items-center justify-center h-[72px] rounded-xl border transition-premium px-1 py-2 gap-2 active:scale-95 ${isActive
                  ? 'sidebar-active-item text-text-primary dark:text-white'
                  : 'bg-transparent border-transparent text-[#667085] dark:text-[#9CA3AF] hover:bg-neutral-100/50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white'
                  }`}
              >
                <div className="flex items-center justify-center transition-premium">
                  {item.icon}
                </div>
                <span className={`text-[13px] font-semibold tracking-tight text-center leading-[1.3] transition-colors duration-200 ${isActive ? 'text-text-primary dark:text-white' : 'text-[#667085] dark:text-[#9CA3AF]'}`}>
                  {item.label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-2 px-2 pb-4">
        <button
          onClick={() => onTabChange('design-system')}
          className={`flex h-12 w-12 flex-col items-center justify-center gap-1.5 rounded-xl border transition-premium active:scale-95 ${activeTab === 'design-system'
            ? 'sidebar-active-item text-text-primary dark:text-white'
            : 'bg-transparent border-transparent text-[#667085] dark:text-[#9CA3AF] hover:bg-neutral-100/50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white'
            }`}
        >
          <div className="flex items-center justify-center">
            <MessageCircle size={20} strokeWidth={1.5} />
          </div>
        </button>

        <button className="flex h-12 w-12 flex-col items-center justify-center gap-1.5 rounded-xl border border-transparent text-[#667085] dark:text-[#9CA3AF] hover:bg-neutral-100/50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white transition-premium">
          <div className="flex items-center justify-center">
            <Settings size={20} strokeWidth={1.5} />
          </div>
        </button>
      </div>
    </div>
  );
}
