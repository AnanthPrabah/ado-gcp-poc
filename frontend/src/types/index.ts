export type UserRole = 'Viewer' | 'Spec Designer' | 'Creative User' | 'Prompt Author' | 'Prompt Publisher' | 'Batch Operator' | 'Batch Manager' | 'Reviewer' | 'Admin' | 'Super Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type ProgressCallback = (message: string) => void;

export type AssetStatus = 'Published' | 'Draft' | 'Review';

export interface Asset {
  id: string;
  title: string;
  imageUrl: any;
  status: AssetStatus;
  category: string;
  tags: string[];
  refId: string;
  createdAt: string;
  progress?: number;
  prompt?: string;
  generatedBy?: string;
  version?: string;
  sku_base?: string;
  collection?: string;
  crown_profile?: string;
  visor?: string;
}

export interface DashboardStats {
  approvedAssets: number;
  pendingReview: number;
  generationsToday: number;
  capacityPercentage: number;
  weeklyGrowth: number;
  avgReviewTime: string;
}

export * from './metadata';


export interface LogoSpecification {
  position: 'front' | 'left-mid' | 'right-mid' | 'rear' | 'visor' | 'other';
  designNumber?: string; // e.g. T310747
  description?: string; // e.g. "STARS"
  exactVisualGeometry?: string; // e.g. "Cartoon Blue Jay holding a baseball bat, white torso, blue head"
  stitchCount?: number;
  colors?: string[]; // Legacy comma-separated list
  colorLayers?: { index: number; description: string; pms?: string }[]; // Structured stitching sequence (e.g. Layer 1, 2, 3)
  visualMapping?: { fill: string; border: string; shadow?: string }; // Role-based mapping from visual drawing (e.g. Fill is Blue, Border is White)
  width?: string; // e.g. "126.98mm"
  height?: string;
  isRaised?: boolean; // For 3D / Puff embroidery
}

export type SilhouetteFamily = '59FIFTY' | '9FIFTY' | '9SEVENTY' | '9FORTY' | '9TWENTY' | '39THIRTY' | 'GOLFER';
export type League = 'MLB' | 'NFL' | 'NBA' | 'MiLB' | 'Generic';

export type ImageModel =
  | 'models/gemini-2.5-pro'
  | 'models/imagen-3.0-generate-002'
  | 'models/gemini-2.5-flash-image'
  | 'models/gemini-2.5-flash'
  | 'models/gemini-2.0-flash';

export type AngleType =
| 'Front Elevation'
| 'Left Profile'
| 'Right Profile'
| 'Three-Quarter Left'
| 'Three-Quarter Right'
| 'Back'
| 'Under View';

export interface RenderOptions {
  teamName?: string;
  silhouetteFamily: SilhouetteFamily | null;
  silhouetteStyle: string; // e.g. "Low Profile", "Retro Crown"
  league: League; // New: Explicit League for Logo Accuracy
  fabricTech: string;
  crownColor: string; // New: Explicit Crown Color
  visorColor: string; // New: Explicit Visor Color
  buttonColor: string; // New: Explicit Button Color
  undervisorColor: string;
  visorStitchingColor?: string; // New: Explicit Stitching Color
  eyeletColor?: string;
  lighting: string;
  additionalNotes: string;
  imageSize: '1K' | '2K' | '4K';
  model: ImageModel;
  angles: AngleType[];
  lifestyleAngles: AngleType[]; // New: Separate angles for Lifestyle/Model shots
  techPackPages?: string[]; // New: Stores individual PDF pages for high-res AI context
  // Manufacturing Data
  tapeNumber?: string;
  sweatbandColor?: string;
  embroideryColors?: string[];
  raisedEmbroideryColors?: string[]; // New: Specific colors designated for 3D Puff

  // BRANDING SPECIFICS (Structured Manifest)
  structuredLogos?: LogoSpecification[];
  allOverPattern?: string;
  
  // Legacy branding props (retained for compatibility)
  frontLogoColors?: string[];
  newEraFlagColor?: string;
  rearLogoColors?: string[];
  sidePatchText?: string;
  backLogoText?: string;
  hasRightSideLogo?: boolean;

  // Virtual Photography
  activeModelIds: string[];
  isPreview?: boolean;
  tweakPrompt?: string;
  visualDesignManifest?: string;
}
