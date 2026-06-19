import type { StaticImageData } from 'next/image';

import capFrontImg from '../assets/images/regenerated_image_1778840878618.jpg';
import capSideImg from '../assets/images/regenerated_image_1778586230872.webp';
import capRearImg from '../assets/images/regenerated_image_1778759971393.webp';
import capTopImg from '../assets/images/regenerated_image_1778757524850.jpg';
import capIsoImg from '../assets/images/regenerated_image_1778586515366.webp';
import techPackSourceImg from '../assets/images/regenerated_image_1778672431063.png';
import underVisorDetailImg from '../assets/images/regenerated_image_1778758168640.jpg';
import sweatbandDetailImg from '../assets/images/regenerated_image_1778757526470.jpg';
import techPackImageImg from '../assets/images/new_era_techpack_v2_1779277538644.png';
import loginBgImg from '../assets/images/login-bg.jpg';

import { getImageSrc } from '../lib/utils';

export const images = {
  capFront: getImageSrc(capFrontImg),
  capSide: getImageSrc(capSideImg),
  capRear: getImageSrc(capRearImg),
  capTop: getImageSrc(capTopImg),
  capIso: getImageSrc(capIsoImg),
  techPackSource: getImageSrc(techPackSourceImg),
  underVisorDetail: getImageSrc(underVisorDetailImg),
  sweatbandDetail: getImageSrc(sweatbandDetailImg),
  techPackImage: getImageSrc(techPackImageImg),
  loginBg: getImageSrc(loginBgImg),
};
