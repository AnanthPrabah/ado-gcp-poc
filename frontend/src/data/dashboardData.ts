import { images } from './imageAssets';
import { 
  Box,
  Activity,
  Layers,
  TrendingUp,
  Clock,
  Zap 
} from 'lucide-react';

export const statsMenuItems = [
  { label: 'UPLOADS DETECTED', value: '142', change: '+12%', icon: Box, iconColor: 'text-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-500/10' },
  { label: 'REFINEMENTS', value: '186', change: '+24%', icon: Activity, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { label: 'DRAFTS SAVED', value: '24', change: '+4', icon: Layers, iconColor: 'text-amber-500', iconBg: 'bg-amber-50 dark:bg-amber-500/10' },
  { label: 'SUCCESS RATE', value: '92%', change: '+2.1%', icon: TrendingUp, iconColor: 'text-purple-500', iconBg: 'bg-purple-50 dark:bg-purple-500/10' },
  { label: 'ACTIVE PROCESS', value: '8', change: '+2', icon: Clock, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { label: 'AVG TIME', value: '1.2s', change: '-0.3s', icon: Zap, iconColor: 'text-rose-500', iconBg: 'bg-rose-50 dark:bg-rose-500/10' },
];

export const recentSessions = [
  { id: '1', title: '59FIFTY THE ORIGINAL', variations: '12 variations', tag: 'S_101.RAW', dotColor: 'bg-blue-500', img: null }, // Mapped dynamically in component
  { id: '2', title: 'Classic 59FIFTY - Red', variations: '8 variations', tag: 'S_102.RAW', dotColor: 'bg-emerald-500', img: null },
  { id: '3', title: 'Team Edition Black', variations: '4 variations', tag: 'S_100.RAW', dotColor: 'bg-amber-500', img: null },
  { id: '3.5', title: 'Vintage 9FORTY Adj.', variations: '6 variations', tag: 'S_103.RAW', dotColor: 'bg-purple-500', img: images.capFront },
];

export const draftGens = [
  { id: '4', title: 'Cyberpunk Streetscape', version: '@v6.0', img: null },
  { id: '5', title: 'Minimalist Watch Study', version: '@v5.2', img: null },
];

export const pendingReviewItems = [
  { id: '6', title: 'Classic 59FIFTY Fitted', subtitle: 'Requires upscaling', img: null },
  { id: '7', title: 'Vintage 9FORTY Adj.', subtitle: 'Review 24 generations', img: null },
];

export const metrics = [
  { label: 'Incoming', count: 12, delta: '+2 from yesterday', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Mapping In Progress', count: 8, delta: '-1 from yesterday', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Exception Queue', count: 14, delta: '+4 from yesterday', color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'Processing', count: 5, delta: '0 from yesterday', color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Awaiting Review', count: 22, delta: '+8 from yesterday', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Completed Today', count: 45, delta: '+12 from yesterday', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];
