
import { SilhouetteFamily, League, AngleType, RenderOptions } from '../types';

export const CAP_HIERARCHY: Record<SilhouetteFamily, string[]> = {
    '59FIFTY': ['The Original', 'Low Profile', 'Retro Crown', 'A-Frame'],
    '9FIFTY': ['The 9FIFTY', 'Low Profile', 'Retro Crown', 'A-Frame'],
    '9SEVENTY': ['9SEVENTY', 'Active', 'MLB', 'NFL'],
    '9FORTY': ['The 9FORTY', 'Stretch Snap', 'A-Frame'],
    '9TWENTY': ['9TWENTY', 'A-Frame', 'College'],
    '39THIRTY': ['THE 39THIRTY'],
    'GOLFER': ['Golfers', 'Throwback', 'NBA']
};

export const LEAGUE_OPTIONS: League[] = ['MLB', 'NFL', 'NBA', 'MiLB', 'Generic'];

export const ALL_ANGLES: AngleType[] = [
    'Front Elevation', 'Left Profile', 'Right Profile', 'Three-Quarter Left', 'Three-Quarter Right', 'Back', 'Under View'
];

// export const STUDIO_SCENES: AssetDefinition[] = [
//     {
//         id: 'product-only',
//         category: 'studio',
//         name: 'Tech Studio',
//         description: 'Pure White Background. Standard Technical View.',
//         uiColor: 'bg-neutral-100',
//     }
// ];

// export const LIFESTYLE_SCENES: AssetDefinition[] = [
//     { id: 'lifestyle-minimal', category: 'lifestyle', name: 'Sun Shadow', description: 'Minimalist wooden stool, window shadows.', uiColor: 'bg-amber-100', thumbnailUrl: 'https://images.unsplash.com/photo-1594235048256-42918df9df9d?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-urban', category: 'lifestyle', name: 'Urban Street', description: 'Concrete ledge, brick wall, cool tones.', uiColor: 'bg-slate-200', thumbnailUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d6dbd?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-industrial', category: 'lifestyle', name: 'Raw Industrial', description: 'Textured concrete floor, hard light.', uiColor: 'bg-neutral-300', thumbnailUrl: 'https://images.unsplash.com/photo-1518640165980-d3e0e2aa24e9?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-outdoor', category: 'lifestyle', name: 'Park Bench', description: 'Wooden bench, soft greenery bokeh.', uiColor: 'bg-emerald-100', thumbnailUrl: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-sport', category: 'lifestyle', name: 'Sport Court', description: 'Outdoor court surface, energetic light.', uiColor: 'bg-orange-100', thumbnailUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-cafe', category: 'lifestyle', name: 'Creative Cafe', description: 'Cafe table, notebook, warm vibes.', uiColor: 'bg-stone-200', thumbnailUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-heritage', category: 'lifestyle', name: 'Premium Heritage', description: 'Marble pedestal, museum lighting.', uiColor: 'bg-gray-100', thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-moody', category: 'lifestyle', name: 'Cinematic Dark', description: 'Dark surface, rim lighting, dramatic.', uiColor: 'bg-indigo-900', thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-fabric', category: 'lifestyle', name: 'Soft Fabric', description: 'Soft Editorial Fabric Vibe. Cap on linen fabric. Soft diffused lighting.', uiColor: 'bg-pink-50', thumbnailUrl: 'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?auto=format&fit=crop&w=300&q=80' },
//     { id: 'lifestyle-stadium', category: 'lifestyle', name: 'Stadium Heritage', description: 'Stadium Heritage Vibe. Cap on stadium steps. Late afternoon sun.', uiColor: 'bg-blue-100', thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=300&q=80' },
// ];

// export const HEADSHOT_MODELS: HeadshotModel[] = [
//     {
//         id: 'varsity-male',
//         category: 'model',
//         name: 'Varsity',
//         gender: 'Male',
//         description: 'Athletic Male, Sports Lighting',
//         uiColor: 'bg-indigo-600',
//         previewUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80'
//     },
//     {
//         id: 'street-female',
//         category: 'model',
//         name: 'Street',
//         gender: 'Female',
//         description: 'Urban Style, Box Braids',
//         uiColor: 'bg-rose-500',
//         previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
//     },
//     {
//         id: 'studio-neutral',
//         category: 'model',
//         name: 'Studio',
//         gender: 'Neutral',
//         description: 'Minimalist Editorial',
//         uiColor: 'bg-neutral-800',
//         previewUrl: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=300&q=80'
//     }
// ];

export const MATERIAL_LIBRARY: Record<string, any[]> = {
    '59FIFTY': [
        { name: 'Authentic On-Field', color: '#171717', type: 'Poly' },
        { name: 'Heritage Wool', color: '#262626', type: 'Wool' },
        { name: 'Team Linen', color: '#d4d4d8', type: 'Linen' },
        { name: 'Diamond Era', color: '#1f1f1f', type: 'Tech' },
        { name: 'Basic Cotton', color: '#333333', type: 'Cotton' },
    ],
    '9FIFTY': [
        { name: 'Basic Cotton', color: '#262626', type: 'Cotton' },
        { name: 'Mesh Ventilated', color: '#000000', type: 'Mesh' },
        { name: 'Nylon Ripstop', color: '#2d2d2d', type: 'Nylon' },
    ]
};

export const UV_COLORS = [
    { name: 'Grey', hex: '#9ca3af' },
    { name: 'Kelly Green', hex: '#16a34a' },
    { name: 'Black', hex: '#000000' },
    { name: 'Pink Glow', hex: '#f472b6' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Purple', hex: '#a855f7' }
];

export const INITIAL_OPTIONS: RenderOptions = {
    silhouetteFamily: null,
    silhouetteStyle: '',
    league: 'Generic',
    fabricTech: '',
    crownColor: '',
    visorColor: '',
    buttonColor: '',
    undervisorColor: '',
    visorStitchingColor: '',
    lighting: 'Studio lighting, soft shadows.',
    additionalNotes: '',
    imageSize: '2K',
    model: 'models/gemini-2.5-pro', // Default for image generation
    angles: ['Front Elevation', 'Left Profile', 'Right Profile', 'Three-Quarter Left', 'Three-Quarter Right', 'Back', 'Under View'],
    lifestyleAngles: ['Three-Quarter Right', 'Front Elevation'], // Default lifestyle angles
    tapeNumber: '',
    sweatbandColor: '',
    embroideryColors: [],
    raisedEmbroideryColors: [],
    // Branding defaults
    frontLogoColors: [],
    newEraFlagColor: 'White',
    rearLogoColors: [],
    // Virtual Photography Defaults
    activeModelIds: ['product-only'],
    isPreview: false, // Default to full production mode
    visualDesignManifest: ''
};
