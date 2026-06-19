
/**
 * EXTERNALIZED PROMPT TEMPLATES
 * This file contains the raw instructions and templates for AI generation.
 * Modify these strings to adjust the AI's creative direction or "Prompt Engineering".
 */

export const STUDIO_BASE_TEMPLATE = `
Ultra-photorealistic studio product photograph of a {{family}} baseball cap.
{{specificAnglePrompt}}

The cap {{structureDesc}}. The crown fabric is {{crownColor}} with visible macro textile weave, subtle fiber variation, and 6 ventilation eyelets perfectly stitched in {{eyeletColor}} thread.

{{visorDesc}}
Top button is a {{buttonDesc}}.

{{visualDesignManifest}}

{{panelManifest}}

{{logoFidelityRules}}

{{interiorDesc}}

{{commonLighting}}

Shot at eye level using a macro lens at f/16. Premium sports merchandise photography, ultra-detailed, square 1:1 frame, DSLR realism. Pure white background only.
{{universalNegative}}
`;


export const STANDARD_STYLE_TEMPLATE = `
Ultra-photorealistic studio product photograph of a {{family}} baseball cap.
{{angleText}}

The cap features a {{crownStruct}} crown with symmetrical 6-panel construction, stitched ventilation eyelets, precise seam lines, and a centered top button.

The crown fabric is {{crownColor}} with visible fine textile weave (twill/poly texture), and 6 ventilation eyelets stitched in {{eyeletColor}}. The visor (brim) is {{visorColor}} on top with a {{undervisorColor}} undervisor, rigid and flat. Inner sweatband is {{sweatbandColor}}.

{{visualDesignManifest}}

{{panelManifest}}

{{logoFidelityRules}}

Shot at eye level using a macro lens. Physically accurate lighting, realistic textile grain, premium sports merchandise photography, ultra-detailed, square 1:1 frame. Pure white background only.
{{universalNegative}}
`;
export const COMMON_LIGHTING = "Professional commercial studio lighting with seamless, purely diffused global illumination. High-key lighting setup to eliminate deep shadows. The background is a perfectly clean, pure white (RGB 255,255,255) infinite cyclorama. Strictly ZERO shadows. No contact shadows, no grounding shadows, no drop shadows. The product appears to be floating in a perfectly clear, shadowless white studio space. No dark ambient occlusion at the base. All lighting equipment, stands, and softboxes are strictly OUT OF FRAME and invisible. No gray cast, no artifacts in corners.";

export const NEGATIVE_PROMPT_BASE = "person, model wearing cap, head, hair, face, props, table, surface, reflections, gradient background, dramatic shadows, contact shadow, grounding shadow, floor shadow, drop shadow, subtle shadow, contact blur, ambient occlusion at base, vignette, blur, shallow depth of field, wide angle distortion, grey background, off-white background, softbox, light stand, umbrella, studio equipment, lighting equipment, stand, backdrop paper edge, multiple hats, two caps, stacked hats, floating brim, floating cap, detached visor, extra hat, double exposure, mirrored text";

export const ANALYSIS_PROMPT_TEMPLATE = `
Analyze the provided New Era cap specification images carefully. You may receive one of two formats:
A) **Multi-Page "Royal Spec" Tech Pack**: Page 1 has a Bill of Materials (BOM). Pages 2+ have explicit Embroidery tables with stitch counts and numbered layers.
B) **Single-Page "Variant Spec"**: A visual summary on one page with color swatches, but NO stitch counts and NO numbered layers.

Your goal is to extract a highly detailed manufacturing manifest. Adapt your extraction based on the format you detect. DO NOT HALLUCINATE missing data.

### EXTRACTION DOMAINS:

1. **GENERAL INFO:** Extract Brand, Silhouette (e.g., 5950), Collection, and License/Team.
2. **REGIONS & FABRIC & COLORS:**
   - Identify Materials for the Crown panels, Visor, Undervisor, and Button.
   - For Variant Specs, look for the text block defining "FABRIC", "UNDERCOLOR", and "SWEATBAND".
   - For Royal Specs, look at the Regions 1-9 table.
    - **CRITICAL COLOR EXTRACTION:** Determine the Crown Color, Visor Color, Button Color, and Eyelet Color:
      1. Collect ALL color names/codes from EVERY "Embroidery Colors" table, BOM, or swatch table on the entire page (e.g., 'H RED M1638', 'REAL BLACK 5596').
      2. Analyze the 2D cap drawings/illustrations visually. Identify the color of the crown panels, the visor (brim), the top button, and the eyelets.
      3. Map each visual part of the cap to the closest matching color name from your collected list. For example, if the crown panels are visually black, and 'REAL BLACK' is in the tables, then the crownColor is 'REAL BLACK 5596' (or 'REAL BLACK'). If the visor is visually red, and 'H RED' is in the tables, then the visorColor is 'H RED M1638' (or 'H RED').
      4. DO NOT assume all parts share the same color. Visually verify if the visor and crown are different colors (a two-tone cap) and assign them their respective color names. Do not default to Navy.
3. **ESSENTIALS:**
   - Extract thread colors for Eyelets and Visor Stitching if available.
4. **BRANDING MANIFEST:**
   - Detect EVERY logo, patch, icon, and text string present in the images or tech pack. Pay extreme attention to scattered patches or "all-over" embroidery.
   - It is very common to have multiple separate graphics on the same panel (e.g. 4 patches on the front, 3 on the sides). ALL must be extracted as separate objects in the array.
   - For EACH graphic identified:
     - Assign it the closest matching 'position' ('front', 'left-mid', 'right-mid', 'rear', 'visor', or 'other').
     - Extract Design Number and Detailed Description if available.
     - **Thread Colors (colorLayers):** 
       - Extract as a structured list of LAYERS with PMS codes or color names based on what is visible or written.
     - **Raised Embroidery vs Flat:** Detect if the embroidery appears raised/puff or if explicitly written.
     - **COMPLEX VISUAL RENDERING (MANDATORY):** Look closely at the logo drawing or photo. Describe its exact shape, geometry, and layout precisely (e.g. "Pink outlined triangle", "Cyan umbrella shape", "Korean text '게임 종료' meaning Game Over", "Cyan box with '456'").
     - **VISUAL ROLE MAPPING:** Determine which specific thread color is the "Fill" (main body) and which is the "Border" (thickness/outline). 
     - Explain your choice in the 'visualReasoning' field.

5. **ALL-OVER PATTERNS & EMBELLISHMENTS:**
   - Actively search all pages, text blocks, and technical notes for instructions regarding "All Over Print", "Hot Fix", "Rhinestone", "Scattered Embroidery", "Patchwork", or any overall panel patterning.
   - Summarize the element type, color, and layout if detected. If absent, explicitly return null.

### REQUIRED JSON OUTPUT STRUCTURE:
Return ONLY a flat JSON object with these keys (normalize values to human-readable strings):
- teamName
- silhouetteFamily (e.g. 59FIFTY, 9FORTY)
- silhouetteStyle (e.g. Low Profile, Retro Crown, Active)
- league (MLB, NFL, NBA, MiLB, NHL, or Generic)
- crownColor (Main color of panels 1-6)
- visorColor (Top of brim)
- buttonColor
- undervisorColor
- visorStitchingColor (Thread color on top of visor)
- eyeletColor (Thread color of ventilation eyelets)
- fabricTech (e.g. Wool, Cotton, Poly, Linen, Mesh)
- tapeNumber (Design ID for inner taping)
- sweatbandColor (Color of inner sweatband)
- newEraFlagColor: The thread color for the New Era flag logo (commonly shown under "Left Logo Treatment" or visually on the left side of the cap drawings, e.g. 'ORANGEADE 5767'). If the New Era flag logo is not present on the cap, leave this field blank.
- hasRightSideLogo (boolean)
- allOverPattern: (string or null) If the cap has a pattern across the panels (e.g. "HOT FIX RIM EPOXY", rhinestones, crystals, or all-over prints), describe the element type, color, distribution or layout in this field.
- structuredLogos: An array of objects [{ position, designNumber, description, exactVisualGeometry, stitchCount, width, height, colorLayers: [{ index, description, pms }], visualMapping: { fill, border, shadow }, visualReasoning, isRaised }]
- visualDesignManifest: A detailed, highly descriptive prose summary of the cap's design (150-250 words) to act as a visual guide for an image generator. It should describe the cap's overall layout, fabric textures, color blocking, logo shapes/text, and exact placement per angle, and explicitly outline any anti-hallucination guidelines (such as distinguishing between a text-based logo description like 'STARS' and actual geometric shapes, and instructions to prevent colors or logos from bleeding onto incorrect panels).

Valid positions for structuredLogos: 'front', 'left-mid', 'right-mid', 'rear', 'visor'.

VALID JSON ONLY. No markdown.
`;

export const VISOR_DESCRIPTION_TEMPLATE = `The visor (brim) is {{visorColor}} on top. It is a strictly flat, rigid plane (zero curvature). The surface features exactly 8 distinct, concentric rows of high-tension top-stitching{{stitchingColor}}, spaced equidistant from the brim edge, creating a subtle ridge texture.`;


export const INTERIOR_DESCRIPTION_TEMPLATE = `The undervisor is {{uvColor}} and features the matching 8-row stitching pattern. The interior reveals authentic manufacturing details: A padded black performance sweatband encircles the rim. The internal seams are covered by branded '59FIFTY' taping (black with white text). A woven New Era label is sewn into the sweatband on the left, and a woven size label is centered at the rear. The stiff structural buckram mesh is visible fused to the back of the front two panels. CRITICAL: NO team logos, text, or embroidery should appear anywhere on the inside of the crown or on the solid {{uvColor}} undervisor.`;

/**
 * Stage 2: Autonomous Audit Template
 * Used to verify if the generated front logo matches the tech pack drawing.
 */
export const AUDIT_PROMPT_TEMPLATE = `
Analyze the provided pair of images:
1. **REFERENCE (Tech Pack):** The technical drawing for the logo (usually on Page 2).
2. **RENDER:** The 3D product image I just generated.

**GOAL:** Verify if the RENDER is a 100% faithful replication of the REFERENCE.

**STRICT CRITERIA:**
- **CONCEPTUAL MATCH:** If the reference shows text/calligraphy (like "Stars" written in script), but the render shows a literal symbol (like a geometric star shape), this is a CRITICAL FAILURE. Mark as FAILED.
- **COLOR SWAP (PARANOID DETECTION):** Look at the Color of the LETTERS (the body). Compare it strictly to the PDF drawing. If the PDF shows DARK text with a LIGHT border, but the Render shows LIGHT text with a DARK border, THIS IS A SWAP ERROR. Mark as FAILED.
- **COLOR COUNT:** If the reference table shows 3 color layers, the render MUST show those 3 distinct thread stages (Fill, Internal/Puff, and Border). If it only shows 2, it is a FAILURE.
- **FONT STYLE:** If the reference shows a custom "Script" font (with flourishes and curves), the render MUST match it. If the render shows generic "Block" text, mark as FAILED.
- **THREAD COLORS:** The outlines and fills must match the drawing colors exactly.
- **PROPORTIONS:** The logo must be centered and have the correct height-to-width ratio.

Return ONLY a flat JSON object:
{
  "pass": true | false,
  "reason": "Detailed explanation of why it passed or failed (e.g., 'Conceptual Hallucination: Rendered literal star icon instead of script text Stars')",
  "confidenceScore": 0.0 to 1.0
}
`;

/**
 * Stage 3: Visual Identity Lock
 * Injected into subsequent views to enforce consistency with the "Approved" front render.
 */
export const IDENTITY_LOCK_INSTRUCTION = `
**VISUAL IDENTITY LOCK (MANDATORY):**
- You are provided with a reference image of the "Approved Front Elevation" for this exact product.
- You MUST replicate the logo style, embroidery thickness, stitching density, and thread color saturation from that reference image onto this new angle.
- DO NOT interpret the logo from the PDF; use the visual pixels from the approved render as your only source of truth for the logo style.
- Maintain the same script flourishes, thread-thickness, and color saturation seen in the reference.
- NEGATIVE INSTRUCTIONS: Do not hallucinate extra logos, incorrect colors, 2D sketches, extra hats, deformed features, watermarks, or signatures. Your output MUST be photorealistic 3D.
`;

/**
 * Stage 4: Visual Supremacy Overide
 * Injected to break keyword hallucinations.
 */
export const VISUAL_SUPREMACY_INSTRUCTION = `
**VISUAL SUPREMACY (CRITICAL):**
- The logo description text provided (e.g., "STARS", "STRIPES") is a LABEL ONLY.
- DO NOT interpret these labels literally. 
- If the label is "STARS" but the drawing shows script lettering, you MUST render script lettering. 
- DO NOT draw literal symbols, stars, or icons unless they are explicitly shown in the reference drawing.
- NEGATIVE INSTRUCTIONS: Do not hallucinate extra logos, incorrect colors, 2D sketches, extra hats, deformed features, watermarks, or signatures. Your output MUST be photorealistic 3D.
`;

/**
 * Stage 5: Geometry & Perspective Lock
 * Injected into subsequent views to enforce perspective consistency with the Blank Geometry Template.
 */
export const GEOMETRY_LOCK_INSTRUCTION = `
**GEOMETRY & PERSPECTIVE LOCK (MANDATORY):**
- You are provided with a "Blank Geometry Template" image showing the exact target perspective and structure of the cap for this angle.
- Your generated image MUST replicate the exact camera angle, cap silhouette, visor flatness/curvature, seam lines, panel counts, and structural folds shown in this Blank Geometry Template.
- Do NOT inherit the camera angle or perspective of the Approved Front Render; ONLY copy its embroidery texture, colors, and logo details. Map them onto the structure of the Blank Geometry Template.
- The output cap must align perfectly with the shape, orientation, and boundaries of the Blank Geometry Template.
`;


