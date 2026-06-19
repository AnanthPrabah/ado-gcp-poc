import type { StaticImageData } from 'next/image';

export function getImageSrc(img: string | StaticImageData | any): string {
  if (!img) return '';
  return typeof img === 'object' && img !== null && 'src' in img ? img.src : img;
}
