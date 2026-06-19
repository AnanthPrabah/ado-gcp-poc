import { Asset, DashboardStats } from '../types';
import { images } from './imageAssets';

export const mockAssets: Asset[] = [
  {
    id: '1',
    refId: 'NE-59FIFTY-NYC-A1',
    title: 'NYC Heritage 59FIFTY',
    imageUrl: images.capFront,
    status: 'Published',
    category: 'Heritage Classics',
    tags: ['MLB', 'FW24', 'AI Generated'],
    createdAt: '2026-05-01',
    version: 'v2.4',
    generatedBy: 'Sarah Jenkins',
    prompt: '/imagine prompt: Photorealistic product shot of a New Era 59FIFTY fitted cap. Color: Deep Navy. Front logo: Classic NYC interlocking letters in crisp white 3D embroidery. Material: Melton Wool. Studio lighting, dark minimalist background, rim light on visor edge. --ar 4:3 --v 5.2 --style raw',
    sku_base: '59FIFTY-BASE-01',
    collection: 'Heritage Q3',
    crown_profile: 'High Structured',
    visor: 'Flat (Curvable)'
  },
  {
    id: '2',
    refId: '#99281A',
    title: 'New York Yankees Jersey Essential Cream 9FORTY',
    imageUrl: 'https://shopthearena.com/cdn/shop/files/60358115-2_600x.jpg?v=1753704023',
    status: 'Draft',
    category: 'Apparel',
    tags: ['Apparel', 'Core', 'AI Generated'],
    createdAt: '2026-05-02'
  },
  {
    id: '3',
    refId: '#SNK-042',
    title: 'New York Yankees MLB Runner 47',
    imageUrl: 'https://www.jdsports.my/cdn/shop/files/jd_70892607_a.jpg?v=1752476908&width=500',
    status: 'Published',
    category: 'Footwear',
    tags: ['Footwear', 'AI Generated'],
    createdAt: '2026-05-03'
  },
  {
    id: '4',
    refId: '#T22-901',
    title: 'New York Yankees Essential Navy 9FORTY',
    imageUrl: images.capFront,
    status: 'Review',
    category: 'Apparel',
    tags: ['Apparel', 'SS24', 'AI Generated'],
    createdAt: '2026-05-04',
    progress: 75
  },
  {
    id: '5',
    refId: '#59F-001',
    title: 'New York Yankees Black Tone 59FIFTY',
    imageUrl: images.capSide,
    status: 'Published',
    category: 'Fitted',
    tags: ['MLB', 'Blackout', 'AI Generated'],
    createdAt: '2026-05-05'
  },
  {
    id: '6',
    refId: '#940-002',
    title: 'LA Dodgers Blue Camo 9FORTY',
    imageUrl: images.capRear,
    status: 'Published',
    category: 'Adjustable',
    tags: ['MLB', 'Camo', 'AI Generated'],
    createdAt: '2026-05-06'
  },
  {
    id: '7',
    refId: '#NEC-VINT',
    title: 'Chicago Bulls Vintage Script 9fORTY',
    imageUrl: images.capTop,
    status: 'Draft',
    category: 'Heritage',
    tags: ['NBA', 'Vintage', 'AI Generated'],
    createdAt: '2026-05-07'
  },
  {
    id: '8',
    refId: '#950-BKL',
    title: 'Brooklyn Nets City Edition 9FIFTY',
    imageUrl: images.capIso,
    status: 'Published',
    category: 'Snapback',
    tags: ['NBA', 'City Edition', 'AI Generated'],
    createdAt: '2026-05-08'
  },
  {
    id: '9',
    refId: '#59F-GLD',
    title: 'New York Yankees Gold Logo 59FIFTY',
    imageUrl: images.capFront,
    status: 'Review',
    category: 'Premium',
    tags: ['MLB', 'Gold', 'AI Generated'],
    createdAt: '2026-05-09',
    progress: 45
  },
  {
    id: '10',
    refId: '#940-TEL',
    title: 'Miami Marlins Teal Coast 9FORTY',
    imageUrl: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&q=80&w=400',
    status: 'Published',
    category: 'Adjustable',
    tags: ['MLB', 'Summer', 'AI Generated'],
    createdAt: '2026-05-10'
  },
  {
    id: '11',
    refId: '#NEC-ARC',
    title: 'Oakland Athletics Archive 59FIFTY',
    imageUrl: 'https://images.unsplash.com/photo-1589831377283-33cb1cc6bd5d?auto=format&fit=crop&q=80&w=400',
    status: 'Published',
    category: 'Fitted',
    tags: ['MLB', 'Archive', 'AI Generated'],
    createdAt: '2026-05-11'
  },
  {
    id: '12',
    refId: '#950-ORG',
    title: 'SF Giants Orange Rush 9FIFTY',
    imageUrl: images.capFront,
    status: 'Draft',
    category: 'Snapback',
    tags: ['MLB', 'Vibrant', 'AI Generated'],
    createdAt: '2026-05-12'
  }
];

export const mockStats: DashboardStats = {
  approvedAssets: 4250,
  pendingReview: 342,
  generationsToday: 1890,
  capacityPercentage: 85,
  weeklyGrowth: 12.5,
  avgReviewTime: '4h'
};
