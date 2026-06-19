import { images } from './imageAssets';

export const generatorImages = [
  images.capIso,      // Mapping from the original genImage1/2/3/4 webp references
  images.capFront,
  images.underVisorDetail,
  images.sweatbandDetail
];

export const generatorTimeline = [
  { version: 'v2.4', image: images.capIso },
  { version: 'v2.3', image: images.capFront },
  { version: 'v2.2', image: images.underVisorDetail },
  { version: 'v2.1', image: images.sweatbandDetail },
  { version: 'v2.0', image: images.capIso }
];

export const recentUploads = [
  { 
    id: '1', 
    name: '59FIFTY_Blueprint_V4.pdf', 
    size: '2.4 MB', 
    time: '2h ago', 
    status: 'READY',
    preview: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: '2', 
    name: 'Material_Spec_Summer24.pdf', 
    size: '12.1 MB', 
    time: '5h ago', 
    status: 'DRAFT',
    preview: images.techPackImage
  },
  { 
    id: '3', 
    name: 'Core_Trucker_Logo_Specs.ai', 
    size: '8.5 MB', 
    time: 'Yesterday', 
    status: 'READY',
    preview: images.techPackSource
  },
  { 
    id: '4', 
    name: 'Archive_2023_Styles.zip', 
    size: '44.8 MB', 
    time: '2d ago', 
    status: 'ARCHIVED',
    preview: null
  },
];

export const generatorMessages = (initialPrompt?: string) => [
  {
    id: 1,
    role: 'user',
    content: initialPrompt || 'Hyper-realistic studio product shot of a white high-profile flat-brim snapback cap with a bright red visor. Front-facing view with a raised embroidered red-and-black bull logo featuring white horns at the center. Detailed stitching, crown eyelets, and a metallic size sticker on the brim. Soft gray gradient background, subtle shadows, premium streetwear aesthetic, professional ecommerce photography, ultra-detailed, photorealistic, 8k.',
    timestamp: '10:24 AM'
  },
  {
    id: 2,
    role: 'assistant',
    content: 'I\'ve created initial concepts focusing on suspended geometric forms in a vast gallery space. The lighting is high-key and soft white.',
    timestamp: '10:25 AM',
    version: 'v1.0'
  },
  {
    id: 3,
    role: 'user',
    content: 'Let\'s add some vibrant color accents to provide contrast against the black and white palette.',
    timestamp: '10:30 AM'
  },
  {
    id: 4,
    role: 'assistant',
    content: 'Absolutely. I\'ve introduced radiant [COLOR_ACCENT] highlights to the suspended shapes. This creates a powerful visual anchor while maintaining the pristine gallery vibe.',
    timestamp: '10:31 AM',
    version: 'v2.4'
  }
];
