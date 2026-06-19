import { images as centralizedImages } from './imageAssets';

export const galleryImages = [
  centralizedImages.capFront,
  centralizedImages.capSide,
  centralizedImages.capRear,
  centralizedImages.capIso,
];

export const galleryAngles = ['FRONT ELEVATION', 'SIDE VIEW', 'REAR VIEW', 'ISO VIEW'];

export const galleryRefinements = [
  {
    angle: 'SIDE VIEW',
    prompt: 'Change body material to performance polyester and make the logo silver metallic.',
    timestamp: '2 hrs ago',
    version: 'v2.4'
  },
  {
    angle: 'FRONT ELEVATION',
    prompt: 'Adjust the 3D embroidery height and increase rim lighting intensity.',
    timestamp: '5 hrs ago',
    version: 'v2.2'
  },
  {
    angle: 'REAR VIEW',
    prompt: 'Add subtle tonal stitching to the closure strap.',
    timestamp: 'Yesterday',
    version: 'v1.8'
  }
];
