import { images } from './imageAssets';

export interface TechpackItem {
  id: string;
  name: string;
  status: 'Processing' | 'Completed' | 'Exception';
  timestamp: string;
}

export const initialData: TechpackItem[] = [
  { id: '7X3B2K', name: '60663847_59FIFTY_MINORAC_ERISEA_OTC', status: 'Processing', timestamp: '10:28:10' },
  { id: 'R9M4P2', name: '71239485_SNAPBACK_ERISEA_MINORAC_OTC', status: 'Processing', timestamp: '10:28:00' },
  { id: 'L1W8Q6', name: '88374621_BUCKET_VALLEY_ERISEA_OTC', status: 'Completed', timestamp: '10:27:50' },
  { id: 'Z5V2N9', name: '99283746_BEANIE_PEAK_ERISEA_OTC', status: 'Exception', timestamp: '10:27:40' },
  { id: 'K4H7J3', name: '55443322_59FIFTY_MINORAC_ERISEA_OTC', status: 'Completed', timestamp: '10:27:30' },
];

export const reviewPreviewImages = [
  { src: images.capFront, label: 'Front Elevation' },
  { src: images.capSide, label: 'THREE-QUARTER RIGHT' },
  { src: images.capRear, label: 'THREE-QUARTER LEFT' },
  { src: images.capTop, label: 'LEFT PROFILE' },
  { src: images.capIso, label: 'RIGHT PROFILE' },
  { src: images.underVisorDetail, label: 'REAR PROFILE' },
  { src: images.sweatbandDetail, label: 'UNDER VIEW' }
];

export const reviewAnglesList = [
  'FRONT ELEVATION',
  'THREE-QUARTER RIGHT',
  'THREE-QUARTER LEFT',
  'LEFT PROFILE',
  'RIGHT PROFILE',
  'REAR PROFILE',
  'UNDER VIEW'
];
