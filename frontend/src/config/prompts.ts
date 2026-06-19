import { RenderOptions, AngleType, SilhouetteFamily, League } from '../types';
import { fillTemplate } from './prompts/engine';
import { 
    STUDIO_BASE_TEMPLATE, 
    STANDARD_STYLE_TEMPLATE, 
    COMMON_LIGHTING, 
    NEGATIVE_PROMPT_BASE,
    ANALYSIS_PROMPT_TEMPLATE,
    VISOR_DESCRIPTION_TEMPLATE,
    INTERIOR_DESCRIPTION_TEMPLATE,
    AUDIT_PROMPT_TEMPLATE,
    IDENTITY_LOCK_INSTRUCTION,
    VISUAL_SUPREMACY_INSTRUCTION,
    GEOMETRY_LOCK_INSTRUCTION
} from './prompts/templates';

/**
 * Helper to get detailed prompt context for specific materials
 */
export const getMaterialContext = (materialName: string): string => {
    const contexts: Record<string, string> = {
        'Authentic On-Field': '100% Polyester (Plain Weave / Poly Twill). The standard modern on-field cap. Smooth, tight diagonal weave visible on close-up. Structured 6-panel high profile. Slight sheen on curves. NOT fuzzy.',
        'Heritage Wool': '100% Wool (Plain Weave). Vintage construction used in retro/heritage collections (Cooperstown). Matte finish, fuzzy organic texture, absorbs light, soft structure. Heat-responsive natural fiber look.',
        'Team Linen': 'Linen (Plain Weave). Lightweight summer fabric. Visible cross-hatch texture, slight natural irregularity in the thread, matte and breathable appearance.',
        'Diamond Era': '100% Polyester (Diamond Jacquard). Technical lightweight fabric with a visible diamond-shaped mesh pattern woven into the fabric. Enhanced ventilation aesthetic.',
        'ProLight': '100% Polyester (Diamond Weave/ProLight). Featherweight performance fabric. Very fine, dense diamond weave. Smooth but with technical micro-texture. Reduced reflectivity compared to standard poly.',
        'Lifestyle Blend': 'Cotton/Polyester Blend (Twill). Casual lifestyle finish. Diagonal twill lines visible but smoother than 100% cotton. Matte finish.',
        'Basic Cotton': '100% Cotton (Twill Weave). Heavy duty diagonal twill texture, matte finish, rugged and durable look.',
        'Performance Poly': '100% Polyester (Plain Weave). Active performance version of the snapback. Smooth, technical, slight gloss.',
        'Hybrid Blend': 'Cotton/Polyester Blend. Front panels: smooth Twill. Mid/Back panels: often mesh or perforated for breathability. Balanced matte/tech look.',
        'Mesh Ventilated': 'Polyester Spacer Mesh. Full mesh construction (or back panels). Distinct open-hole or spacer mesh texture. High transparency in mesh areas, sporty tech look.',
        'Nylon Ripstop': 'Nylon Rip Stop. Performance outdoor fabric. Distinct grid pattern (square reinforcement threads) visible across the surface. Matte, papery texture.',
        'Jersey Knit': 'Cotton Jersey. Soft, t-shirt like material. Knitted texture (loops visible on macro zoom), heathered appearance, soft and unstructured visual weight.',
        'Poly Mesh': 'Open hole trucket mesh back. Glossy plastic mesh texture.',
        'Leather': 'Premium Leather. Smooth grain, semi-gloss reflective surface, luxurious texture.'
    };
    return contexts[materialName] || `${materialName} texture`;
};

// 1. ANGLE MAP (Controls Camera Language)
export const ANGLE_DESCRIPTIONS: Record<string, string> = {
    'Front Elevation': "shown from a perfectly straight front angle with symmetrical composition",
    'Left Profile': "shown from a perfect left side profile",
    'Right Profile': "shown from a perfect right side profile",
    'Three-Quarter Left': "shown at a 3/4 front-left angle",
    'Three-Quarter Right': "shown at a 3/4 front-right angle",
    'Back': "shown from a perfect straight 180-degree rear angle",
    'Under View': "shown from inside the cap looking upward"
};

// 2. LEAGUE LOGO DEFINITIONS
export const LEAGUE_LOGOS: Record<League, string> = {
    'MLB': 'the official MLB Batterman logo (rectangular with rounded corners). The logo features a white silhouette of a batter facing LEFT (swinging right-handed), flanked by two color fields',
    'NFL': 'the official NFL Shield logo (sharp crest shape with stars and football)',
    'NBA': 'the official NBA Jerry West Logoman (tall rectangle with dribbling silhouette)',
    'MiLB': 'the official MiLB logo (batter silhouette)',
    'Generic': 'a generic professional league logo'
};

// 3. STRUCTURE DEFINITIONS
export const CROWN_STRUCTURES: Record<SilhouetteFamily, string> = {
    '59FIFTY': "structured high profile",
    '9FIFTY': "structured high profile",
    '9SEVENTY': "structured modern profile",
    '9FORTY': "structured contoured",
    '39THIRTY': "structured contoured stretch-fit",
    '9TWENTY': "unstructured low profile",
    'GOLFER': "semi-structured retro"
};

/**
 * 4. PROMPT CONSTRUCTOR
 * Uses a per-angle Panel Manifest to prevent logo hallucination.
 * Each view explicitly declares which logos appear on which panels,
 * AND hard-prohibits all other logos from appearing.
 */
export const constructTechStudioPrompt = (options: RenderOptions, angle: AngleType, hasReference: boolean = false): string => {
    const family = options.silhouetteFamily || '59FIFTY';
    const angleText = ANGLE_DESCRIPTIONS[angle] || "shown from a cinematic product angle";
    const crownStruct = CROWN_STRUCTURES[family] || "structured";
    const league = options.league || 'Generic';
    const flagColor = options.newEraFlagColor || 'White';

    // 1. Negative Prompt
    let negativePromptBase = NEGATIVE_PROMPT_BASE;
    if (angle !== 'Under View') {
        negativePromptBase += ", inner label, inside tag, sweatband logo, interior branding, brand tag inside, inner taping text";
    } else {
        negativePromptBase += ", team logo on inner panels, transparent front panels, reverse embroidery, inside crown logo, graphic printed on buckram";
    }
    
    if (angle === 'Back') {
        negativePromptBase += ", visor, brim, front peak, bill, visor protruding, brim showing from behind, front brim, visible peak, underbrim, undervisor, front panels, bill sticking out";
    } else if (angle === 'Right Profile' || angle === 'Left Profile') {
        negativePromptBase += ", front logo bleeding onto side, front logo visible, front graphic on side, front logo on side panel, distorted side logo, double logo, mirrored logo, reversed logo";
    }
    
    // Add rendering artifacts avoidance
    negativePromptBase += ", logo bleeding across panels, duplicate logos, stretched logo on side, misaligned seam, double front logo";
    
    const isCurvedBrimModel = ['9FORTY', '39THIRTY', '9TWENTY', 'GOLFER'].includes(family);
    if (!isCurvedBrimModel) {
        negativePromptBase = "curved brim, bent visor, " + negativePromptBase;
    }

    // 2.2 Dynamic Key-Word Hallucination Prevention
    const problematicKeywords: Record<string, string> = {
        'STARS': 'literal star shapes, geometric stars, star icon, celestial symbols',
        'STRIPES': 'literal geometric stripes, parallel bars, warning stripes',
        'GLOBE': 'literal world map drawing, earth icon, latitude lines',
        'LEAF': 'literal botanical leaf, nature icon, plant symbol'
    };

    let keywordNegatives = "";
    options.structuredLogos?.forEach(logo => {
        const desc = (logo.description || "").toUpperCase();
        for (const [kw, neg] of Object.entries(problematicKeywords)) {
            if (desc.includes(kw)) {
                keywordNegatives += `${neg}, `;
            }
        }
    });
    
    const universalNegative = `**NEGATIVE PROMPT:** ${keywordNegatives}${negativePromptBase}`;

    // 2. Resolve logos from Tech Pack data
    const frontLogos = options.structuredLogos?.filter(l => l.position === 'front') || [];
    const leftLogos = options.structuredLogos?.filter(l => l.position === 'left-mid') || [];
    const rightLogos = options.structuredLogos?.filter(l => l.position === 'right-mid') || [];
    const rearLogos = options.structuredLogos?.filter(l => l.position === 'rear') || [];
    const visorLogos = options.structuredLogos?.filter(l => l.position === 'visor') || [];
    
    const formatLogoColors = (logo: any) => {
        let roles = "";
        if (logo?.visualMapping) {
            const { fill, border, shadow } = logo.visualMapping;
            roles = `MANDATORY CHROMATIC HIERARCHY: The main body/letters of the LOGO IS ${fill}. The distinct outline surrounding the letters IS ${border}${shadow ? `, and the Shadow IS ${shadow}` : ""}. DO NOT REVERSE THESE COLORS. Letters = ${fill}, Outlines = ${border}. `;
        }

        if (logo?.colorLayers && logo.colorLayers.length > 0) {
            return roles + "PHYSICAL STITCHING SEQUENCE: " + logo.colorLayers
                .map((l: any) => `Stage ${l.index || '?'} (${l.description}${l.pms ? ` / PMS ${l.pms}` : ''})`)
                .join(', ');
        }
        return roles + (logo?.colors || []).join(', ');
    };

    // 3. Build logo text strings
    const getLogoListText = (logos: any[], defaultEmpty: string, context: string = '') => {
        if (!logos || logos.length === 0) return defaultEmpty;
        const descriptions = logos.map((logo, index) => {
            const geom = logo.exactVisualGeometry ? `VISUAL SHAPE/GEOMETRY: ${logo.exactVisualGeometry}. ` : '';
            const size = (logo.width && logo.height) ? ` PROPORTIONS: ${logo.width} W x ${logo.height} H. ` : '';
            const _colors = formatLogoColors(logo);
            const isRaised = logo.isRaised ? "physically raised 3D puff embroidery. " : "flat embroidery. ";
            return `Graphic ${index + 1}: Logo ${logo.designNumber || ''} ("${logo.description}"). ${geom}${isRaised}${size}${_colors}`;
        });
        return `${context} Render the following scattered graphics:\n` + descriptions.map(d => `- ${d}`).join('\n');
    };

    const frontLogoText = getLogoListText(frontLogos, options.additionalNotes || 'the primary front team logo', 'Center/scattered on the front two panels.');
    const leftLogoText = getLogoListText(leftLogos, `the New Era Flag logo in ${flagColor} thread.`, 'On the wearer\'s left side panel.');
    const rightLogoText = getLogoListText(rightLogos, 'The right side panel is PLAIN, CLEAN fabric with NO logo on the side itself.', 'On the wearer\'s right side panel.');
    const rearLogoText = getLogoListText(rearLogos, `${LEAGUE_LOGOS[league]} (Batterman) in raised embroidery. ${options.rearLogoColors ? `Colors: ${options.rearLogoColors.join(', ')}` : ''}`, 'Centered on the rear panels.');
    const visorLogoText = getLogoListText(visorLogos, '', 'Scattered on the top of the visor brim:');

    // 4. PER-ANGLE PANEL MANIFEST — the core fix
    // Every angle has an explicit "what IS visible" + "what is PROHIBITED"
    const buildPanelManifest = (): string => {
        const patternContext = options.allOverPattern ? `\n[PATTERN VISIBILITY]: An all-over pattern or epoxy jewel pattern is present across the panels: ${options.allOverPattern}. Render this accurately on the visible panels.` : "";
        const visorContext = visorLogos.length > 0 ? `\n[VISIBLE] VISOR: ${visorLogoText}` : "";
        
        switch (angle) {
            case 'Front Elevation':
                return `
**LOGO MANIFEST — FRONT ELEVATION VIEW:**
[VISIBLE] FRONT PANEL: ${frontLogoText}${visorContext}
[HIDDEN] LEFT SIDE PANEL: Not visible in this view.
[HIDDEN] RIGHT SIDE PANEL: Not visible in this view.
[HIDDEN] REAR: Not visible in this view.${patternContext}`;

            case 'Left Profile':
                return `
**LOGO MANIFEST — LEFT PROFILE VIEW:**
[CAMERA & ORIENTATION] 90-DEGREE TRUE SIDE PROFILE. The cap faces PERFECTLY LEFT (visor points directly to the left edge of the frame). We are looking directly at the wearer's LEFT side.
[VISIBLE] LEFT SIDE PANEL (MAIN SUBJECT): THIS IS THE FOCUS. ${leftLogoText}
[HIDDEN] RIGHT SIDE PANEL: Not visible.
[HIDDEN] FRONT LOGO: TRULY FROM THE SIDE. If the front logo is 3D embroidery, only its extruded side profile is slightly visible on the front curve. DO NOT paint or clone the front logo onto the side panel. The side panel MUST remain clean of front logo elements.${visorContext}${patternContext}`;

            case 'Right Profile':
                return `
**LOGO MANIFEST — RIGHT PROFILE VIEW:**
[CAMERA & ORIENTATION] 90-DEGREE TRUE SIDE PROFILE. The cap faces PERFECTLY RIGHT (visor points directly to the right edge of the frame). We are looking directly at the wearer's RIGHT side.
[VISIBLE] RIGHT SIDE PANEL (MAIN SUBJECT): THIS IS THE FOCUS. ${rightLogoText} (CRITICAL: DO NOT MIRROR OR FLIP TEXT. The text/graphic MUST read correctly from left to right)
[HIDDEN] LEFT SIDE PANEL: Not visible. DO NOT RENDER the New Era flag or any left-side logo here.
[HIDDEN] FRONT LOGO: TRULY FROM THE SIDE. If the front logo is 3D embroidery, only its extruded side profile is slightly visible on the front curve. DO NOT paint or clone the front logo onto the side panel. The side panel MUST remain clean of front logo elements.${visorContext}${patternContext}`;


            case 'Three-Quarter Left':
                return `
**LOGO MANIFEST — THREE-QUARTER LEFT VIEW:**
[CAMERA & ORIENTATION] The cap faces forward and slightly RIGHT (visor points towards the bottom-right). We see the front panels and the wearer's left side panel.
[VISIBLE] FRONT PANEL: ${frontLogoText} physically turning with the curvature.
[VISIBLE] LEFT SIDE PANEL: Entirely visible. ${leftLogoText}
[HIDDEN] RIGHT SIDE PANEL: Entirely hidden. DO NOT RENDER any right-side elements.${visorContext}${patternContext}`;

            case 'Three-Quarter Right':
                return `
**LOGO MANIFEST — THREE-QUARTER RIGHT VIEW:**
[CAMERA & ORIENTATION] The cap faces forward and slightly LEFT (visor points towards the bottom-left). We see the front panels and the wearer's right side panel.
[VISIBLE] FRONT PANEL: ${frontLogoText} physically turning with the curvature. CRITICAL: DO NOT MIRROR OR FLIP. The text/graphic MUST read correctly from left to right.
[VISIBLE] RIGHT SIDE PANEL (FULL FOCUS): ${rightLogoText} (CRITICAL: DO NOT MIRROR TEXT).
[HIDDEN] LEFT SIDE PANEL: Entirely hidden. DO NOT RENDER the New Era flag or any left-side logo here.${visorContext}${patternContext}`;

            case 'Back':
                return `
**LOGO MANIFEST — REAR VIEW:**
[VISIBLE] REAR PANEL (MAIN SUBJECT): ${rearLogoText}
[HIDDEN] FRONT PANEL: Completely hidden and obscured by the crown.
[HIDDEN] SIDE PANELS: Not visible.
[HIDDEN] VISOR/BRIM: CRITICAL: The visor must be COMPLETELY INVISIBLE. It is pointing directly away from the camera and is entirely blocked by the dome of the crown. Do not render any part of the brim.${patternContext}`;

            case 'Under View':
                return `
**LOGO MANIFEST — INTERIOR UNDER VIEW:**
[CAMERA] Worm's eye view from INSIDE the cap looking UP.
[VISIBLE] UNDERVISOR: Plain ${options.undervisorColor || 'Grey'} cotton twill fabric with visible concentric stitching rows.
[VISIBLE] SWEATBAND: Padded black performance fabric encircling the lower rim.
[VISIBLE] INTERIOR PANELS: Plain grey structural buckram mesh.
[HIDDEN] EXTERIOR: The interior MUST be perfectly clean. No semi-transparent embroidery should be visible on the inside.`;

            default:
                return `**VIEW:** ${angleText}. Render only the panels visible from this angle with their designated logos.${visorContext}${patternContext}`;
        }
    };

    const panelManifest = buildPanelManifest() + 
        (hasReference ? `\n\n${IDENTITY_LOCK_INSTRUCTION}` : `\n\n${VISUAL_SUPREMACY_INSTRUCTION}`);

    const logoFidelityRules = angle === 'Under View' ? "" : `
**STRICT VISUAL FIDELITY (CRITICAL):**
- DO NOT use generic fonts, custom scripts, or redesign any logos.
- You MUST replicate the EXACT visual artwork, proportions, and curves of the logos shown in the 'Embroidery & Graphic Specifications' section.
- Match the thread colors, outlines, and 'swoosh' shapes pixel-for-pixel from the reference drawing.

**EMBROIDERY RENDER QUALITY:**
- Render all embroidery with heavy, dense layered stitching. Individual thread strands must be visible.
- Embroidery must have significant 3D depth with micro-shadows between stitch rows.
- Threads should have a subtle satin-like sheen reflecting studio light.
- **COLOR ACCURACY:** Thread colors must exactly match the visual appearance and PMS values specified in the Tech Pack. Match outlines and fills perfectly.`;

    // 5. Build 59FIFTY specific prompts
    if (family === '59FIFTY') {
        let specificAnglePrompt = "";
        const structureDesc = "features a High-Profile Structured crown with vertical, buckram-reinforced front panels that create a boxy silhouette, transitioning to a spherical rear closure. The crown rises 90 degrees vertically from the brim.";

        const visorDesc = fillTemplate(VISOR_DESCRIPTION_TEMPLATE, {
            visorColor: options.visorColor || options.crownColor,
            stitchingColor: options.visorStitchingColor ? ` in ${options.visorStitchingColor} thread` : ''
        });

        const buttonDesc = `centered, raised, 12mm hemispherical fabric-covered ${options.buttonColor || options.crownColor} button`;
        let interiorDesc = "";

        switch (angle) {
            case 'Front Elevation':
                specificAnglePrompt = "Orthographic Front View. High-profile vertical rise (90 degrees). Boxy 'billboard' silhouette. Front panels perpendicular to perfectly flat horizontal visor. Zero curvature on brim. Symmetrical composition.";
                break;
            case 'Three-Quarter Right':
                specificAnglePrompt = "Front-Right Three-Quarter View. The cap faces forward and slightly LEFT relative to the camera. We see the front panels and the entire right side panel. The visor points towards the bottom-left of the frame. CRITICAL CHECK: ENSURE TEXT AND LOGOS ARE NOT MIRRORED.";
                break;
            case 'Three-Quarter Left':
                specificAnglePrompt = "Front-Left Three-Quarter View. The cap faces forward and slightly RIGHT relative to the camera. We see the front panels and the entire left side panel. The visor points towards the bottom-right of the frame.";
                break;
            case 'Right Profile':
                specificAnglePrompt = "Strict 90-degree Orthographic Right Profile. The cap faces perfectly to the RIGHT. Visor points exactly to the RIGHT edge. We are looking at the wearer's RIGHT side. We see ONLY the right side panel and the profile of the crown. The front logo MUST NOT wrap onto the side.";
                break;
            case 'Left Profile':
                specificAnglePrompt = "Strict 90-degree Orthographic Left Profile. The cap faces perfectly to the LEFT. Visor points exactly to the LEFT edge. We are looking at the wearer's LEFT side. We see ONLY the left side panel and the profile of the crown. The front logo MUST NOT wrap onto the side.";
                break;
            case 'Back':
                specificAnglePrompt = "Straight Rear View (180 degrees). Camera looks directly at the absolute back of the cap. The visor points completely AWAY from the camera and MUST BE INVISIBLE. Only the rear panels and lower edge should be seen. Ensure NO BRIM/VISOR is sticking out to the sides or front.";
                break;
            case 'Under View':
                specificAnglePrompt = "Interior upward view. Camera is INSIDE the cap looking UP. The undervisor underside is at the top of the frame. The sweatband and inner structure are prominent. No exterior is visible.";
                interiorDesc = fillTemplate(INTERIOR_DESCRIPTION_TEMPLATE, {
                    uvColor: options.undervisorColor || 'Grey'
                });
                break;
            default:
                specificAnglePrompt = angleText;
        }

        return fillTemplate(STUDIO_BASE_TEMPLATE, {
            family,
            specificAnglePrompt,
            structureDesc,
            crownColor: options.crownColor,
            eyeletColor: options.eyeletColor || options.crownColor,
            visorDesc,
            buttonDesc,
            visualDesignManifest: options.visualDesignManifest 
                ? `**VISUAL DESIGN MANIFEST (GROUND TRUTH STYLE GUIDE):**\n${options.visualDesignManifest}\n` 
                : '',
            panelManifest,
            logoFidelityRules,
            interiorDesc: interiorDesc,
            commonLighting: COMMON_LIGHTING,
            universalNegative
        });
    }

    // --- CASE B: STANDARD MODEL TEMPLATE ---
    return fillTemplate(STANDARD_STYLE_TEMPLATE, {
        family,
        angleText,
        crownStruct,
        crownColor: options.crownColor,
        eyeletColor: options.eyeletColor || options.crownColor,
        visorColor: options.visorColor || options.crownColor,
        undervisorColor: options.undervisorColor,
        sweatbandColor: options.sweatbandColor || 'Black',
        visualDesignManifest: options.visualDesignManifest 
            ? `**VISUAL DESIGN MANIFEST (GROUND TRUTH STYLE GUIDE):**\n${options.visualDesignManifest}\n` 
            : '',
        panelManifest,
        logoFidelityRules,
        leagueLogo: LEAGUE_LOGOS[league],
        universalNegative
    });
};

/**
 * 5. SCENE DEFINITIONS (Legacy/Lifestyle Support)
 */
export const SCENE_PROMPTS: Record<string, string> = {
    'lifestyle-minimal': `**CONTEXT:** Sun Shadow Minimal Vibe. **SCENE:** Cap on wooden stool, plaster wall. **LIGHTING:** Window light, soft shadows.`,
    'lifestyle-urban': `**CONTEXT:** Urban Street Vibe. **SCENE:** Cap on concrete ledge, brick wall. **LIGHTING:** Directional, gritty contrast.`,
    'lifestyle-industrial': `**CONTEXT:** Raw Industrial Vibe. **SCENE:** Cap on concrete floor. **LIGHTING:** Hard directional light.`,
    'lifestyle-outdoor': `**CONTEXT:** Outdoor Weekend Vibe. **SCENE:** Cap on park bench, greenery bokeh. **LIGHTING:** Open shade, natural.`,
    'lifestyle-sport': `**CONTEXT:** Sport Surface Vibe. **SCENE:** Cap on basketball court. **LIGHTING:** Bright backlight, energetic.`,
    'lifestyle-cafe': `**CONTEXT:** Creative Cafe Vibe. **SCENE:** Cap on cafe table, coffee cup blurred. **LIGHTING:** Soft window light.`,
    'lifestyle-heritage': `**CONTEXT:** Heritage Premium Vibe. **SCENE:** Cap on marble pedestal. **LIGHTING:** Museum diffused.`,
    'lifestyle-moody': `**CONTEXT:** Moody Evening Vibe. **SCENE:** Dark surface, deep shadows. **LIGHTING:** Rim light.`,
    'lifestyle-fabric': `**CONTEXT:** Soft Editorial Fabric Vibe. **SCENE:** Cap on linen fabric. **LIGHTING:** Soft diffused.`,
    'lifestyle-stadium': `**CONTEXT:** Stadium Heritage Vibe. **SCENE:** Cap on stadium steps. **LIGHTING:** Late afternoon sun.`,
    'varsity-male': `**CONTEXT:** Sports Photography. **SUBJECT:** Male athlete, defined jawline. **LIGHTING:** High-contrast rim light.`,
    'street-female': `**CONTEXT:** Streetwear Lookbook. **SUBJECT:** Female model, box braids. **LIGHTING:** Soft beauty light.`,
    'studio-neutral': `**CONTEXT:** E-Commerce. **SUBJECT:** Gender-neutral model. **LIGHTING:** Flat bright commercial.`,
};

export const ANALYSIS_PROMPT = ANALYSIS_PROMPT_TEMPLATE;
export const AUDIT_PROMPT = AUDIT_PROMPT_TEMPLATE;
export const GEOMETRY_LOCK = GEOMETRY_LOCK_INSTRUCTION;