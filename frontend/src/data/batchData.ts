import React from 'react';

export const batches = [
  { id: 'B-117', styleRange: '59FIFTY', throughput: '5', status: 'IN PROGRESS', type: 'progress' },
  { id: 'B-116', styleRange: '59FIFTY', throughput: '12', status: 'COMPLETED', type: 'success' },
  { id: 'B-115', styleRange: '9FORTY', throughput: '8', status: 'COMPLETED', type: 'success' },
  { id: 'B-114', styleRange: '39THIRTY', throughput: '15', status: 'HALTED', type: 'danger' },
  { id: 'B-113', styleRange: '9FORTY', throughput: '10', status: 'COMPLETED', type: 'success' },
];

export const batchDetailItems = [
  { id: 'B-117-X', styleRange: '59FIFTY', throughput: 'LA DODGERS HOME ROYAL', status: 'SCANNING', progress: 12, sla: 'Pending', slaColor: 'bg-slate-300', color: 'text-blue-500' },
  { id: 'B-117-Y', styleRange: '59FIFTY', throughput: 'NY YANKEES NAVY CLASSIC', status: 'EXTRACTING', progress: 45, sla: 'On Track', slaColor: 'bg-emerald-500', color: 'text-cyan-600' },
  { id: 'B-117-Z', styleRange: '59FIFTY', throughput: 'CHICAGO CUBS GAME BLUE', status: 'RENDERING', progress: 89, sla: 'On Track', slaColor: 'bg-emerald-500', color: 'text-teal-600' },
  { id: 'B-117-E', styleRange: '59FIFTY', throughput: 'BOSTON RED SOX SCARLET', status: 'HALTED', progress: 50, sla: 'Failed', slaColor: 'bg-rose-500', color: 'text-rose-500', isFailed: true },
  { id: 'B-117-C', styleRange: '59FIFTY', throughput: 'SF GIANTS BLACK ORANGE', status: 'COMPLETED', progress: 100, sla: 'On Track', slaColor: 'bg-emerald-500', color: 'text-emerald-600' },
];

export const recentBatches = [
  { id: 'BTCH-2026-0341', source: 'EasyVariant', date: '2026-05-20 08:30', total: 120, mapped: 120, unmapped: 0, status: 'Completed', priority: 'High', due: '2026-05-21' },
  { id: 'BTCH-2026-0342', source: 'Manual Upload', date: '2026-05-20 09:15', total: 45, mapped: 31, unmapped: 14, status: 'Exception', priority: 'Normal', due: '2026-05-22' },
  { id: 'BTCH-2026-0343', source: 'EasyVariant', date: '2026-05-20 10:00', total: 88, mapped: 88, unmapped: 0, status: 'Processing', priority: 'High', due: '2026-05-21' },
  { id: 'BTCH-2026-0344', source: 'EasyVariant', date: '2026-05-20 10:45', total: 210, mapped: 180, unmapped: 30, status: 'Mapping', priority: 'Low', due: '2026-05-25' },
  { id: 'BTCH-2026-0345', source: 'Manual Upload', date: '2026-05-20 11:30', total: 60, mapped: 60, unmapped: 0, status: 'Incoming', priority: 'Normal', due: '2026-05-23' },
];

export const exceptions = [
  { id: 'ITEM-00892', style: '60435652', batch: 'BTCH-2026-0342', reason: 'Missing Metadata' },
  { id: 'ITEM-00893', style: '70AFBSLG', batch: 'BTCH-2026-0342', reason: 'No Matching Prompt' },
  { id: 'ITEM-00894', style: '60435652', batch: 'BTCH-2026-0342', reason: 'Low Confidence Match' },
  { id: 'ITEM-00895', style: '70AFBSLG', batch: 'BTCH-2026-0342', reason: 'Rule Conflict' },
  { id: 'ITEM-00896', style: '60435652', batch: 'BTCH-2026-0342', reason: 'Missing Metadata' },
];

export const exceptionItems = [
  { id: 'ITEM-00892', style: '60435652', batch: 'BTCH-2026-0342', color: 'Gold', silhouette: '59FIFTY', reason: 'Missing Metadata', description: 'The tech pack is missing key metadata fields (silhouette not detected, material unknown, etc.)' },
  { id: 'ITEM-00893', style: '70AFBSLG', batch: 'BTCH-2026-0342', color: 'Velvet', silhouette: '9FORTY', reason: 'No Matching Prompt', description: 'No published prompt preset exists that covers this product type' },
  { id: 'ITEM-00894', style: '60435652', batch: 'BTCH-2026-0342', color: 'Diamond Mesh', silhouette: '59FIFTY', reason: 'Missing Metadata', description: 'The tech pack is missing key metadata fields (silhouette not detected, material unknown, etc.)' },
  { id: 'ITEM-00895', style: '70AFBSLG', batch: 'BTCH-2026-0342', color: 'Contrast Stitch', silhouette: '59FIFTY', reason: 'Rule Conflict', description: 'Two or more rules match the item and conflict with each other, so the system cannot decide.' },
];

export const exceptionQueueItems = [
  { id: 'ITEM-00892', style: '60435652', color: 'Gold', silhouette: '59FIFTY', reason: 'Missing Metadata', description: 'The tech pack is missing key metadata fields (silhouette not detected, material unknown, etc.)' },
  { id: 'ITEM-00893', style: '70AFBSLG', color: 'Velvet', silhouette: '9FORTY', reason: 'No Matching Prompt', description: 'No published prompt preset exists that covers this product type' },
  { id: 'ITEM-00894', style: '60435652', color: 'Diamond Mesh', silhouette: '59FIFTY', reason: 'Missing Metadata', description: 'The tech pack is missing key metadata fields (silhouette not detected, material unknown, etc.)' },
  { id: 'ITEM-00895', style: '70AFBSLG', color: 'Contrast Stitch', silhouette: '59FIFTY', reason: 'Rule Conflict', description: 'Two or more rules match the item and conflict with each other, so the system cannot decide.' },
];
