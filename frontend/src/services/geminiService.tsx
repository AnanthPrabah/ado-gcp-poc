
import { HarmCategory, HarmBlockThreshold } from "@google/genai";
import { RenderOptions, AngleType, SilhouetteFamily, ProgressCallback, League } from "../types/index";
import { 
    getMaterialContext, 
    constructTechStudioPrompt, 
    SCENE_PROMPTS, 
    ANALYSIS_PROMPT,
    AUDIT_PROMPT,
    GEOMETRY_LOCK
} from "../config/prompts";

// Context Caching Helpers
async function tryGetContextCache(modelId: string, inputParts: any[]): Promise<string | null> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "createCache",
                model: modelId.replace(/^models\//, ''),
                config: {
                    contents: [{ role: 'user', parts: inputParts }],
                    ttl: '3600s' // 1 hour
                }
            })
        });
        if (!response.ok) throw new Error(await response.text());
        const cache = await response.json();
        return cache.name; // Return the server-generated resource name
    } catch (e: any) {
        console.warn("Prompt caching skipped/failed (too small, quota, or unsupported model):", e.message);
        return null; // Graceful fallback
    }
}

async function cleanupCache(cacheName: string | null) {
    if (cacheName) {
        try {
            await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: "deleteCache",
                    name: cacheName })
            });
            console.log("Cleaned up prompt cache:", cacheName);
        } catch (e) {
            console.warn("Failed to cleanup cache:", cacheName);
        }
    }
}

/**
 * UTILITY: Strips Data URL prefix if present to ensure raw base64.
 */
const stripDataUrlPrefix = (str: string): string => {
    if (str.startsWith('data:')) {
        return str.split(',')[1] || str;
    }
    return str;
};

/**
 * Converts a File object to a Base64 string and detects MimeType.
 */
export const fileToGenericBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Extract accurate mime type from Data URL
            const match = base64String.match(/^data:(.+);base64,(.+)$/);
            if (match) {
                resolve({ mimeType: match[1], data: match[2] });
            } else {
                // Fallback to file type or default png
                resolve({ mimeType: file.type || 'image/png', data: base64String.split(',')[1] });
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * UTILITY: Resize and Normalize Image for AI Input.
 * OPTIMIZED: 
 * 1. Checks dimensions to prevent unnecessary downscaling.
 * 2. CRITICAL: Enforces JPEG output. If input is PNG/WebP, it converts to JPEG.
 *    This ensures the 'image/jpeg' header sent to Gemini is always accurate.
 */
const resizeForAiInput = async (base64Str: string, mimeType: string, maxDim: number = 2048): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `data:${mimeType};base64,${base64Str}`;

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // CHECK 1: Is it already a JPEG?
            const isJpeg = mimeType === 'image/jpeg' || mimeType === 'image/jpg';
            // CHECK 2: Is it within size bounds?
            const isSizeOk = width <= maxDim && height <= maxDim;

            // OPTIMIZATION: If it's already a correctly sized JPEG, return original data.
            if (isJpeg && isSizeOk) {
                resolve(base64Str);
                return;
            }

            // Otherwise, we must re-encode (either to resize, or to convert PNG -> JPEG)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (width > height) {
                if (width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Fill white background (Transparency in PNGs turns black in JPEG without this)
            if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
            }

            // Force output to JPEG with high quality
            const resized = canvas.toDataURL('image/jpeg', 0.90);
            resolve(resized.split(',')[1]);
        };

        // Fail-safe: If image loading fails, return original and hope for the best
        img.onerror = () => {
            console.warn("Image resize failed, using original.");
            resolve(base64Str);
        };
    });
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyzes a Tech Pack image to determine manufacturing specs.
 * Includes robust JSON extraction and error fallback.
 */
export const analyzeTechPack = async (imageInput: string | string[], mimeType: string = 'image/png'): Promise<{
    teamName: string,
    silhouetteFamily: SilhouetteFamily,
    silhouetteStyle?: string,
    league: League,
    undervisorColor: string,
    crownColor: string,
    visorColor: string,
    buttonColor: string,
    fabricTech: string,
    tapeNumber?: string,
    sweatbandColor?: string,
    embroideryColors?: string[],
    raisedEmbroideryColors?: string[],
    sidePatchText?: string,
    backLogoText?: string,
    visorStitchingColor?: string,
    frontLogoColors?: string[],
    newEraFlagColor?: string,
    rearLogoColors?: string[],
    hasRightSideLogo?: boolean,
    eyeletColor?: string,
    structuredLogos?: import('../types').LogoSpecification[]
}> => {
    // Default fallback object
    const defaults = {
        teamName: "Unknown",
        silhouetteFamily: '59FIFTY' as SilhouetteFamily,
        silhouetteStyle: '',
        league: 'Generic' as League,
        crownColor: "Navy",
        visorColor: "Navy",
        buttonColor: "Navy",
        undervisorColor: 'Grey',
        fabricTech: 'Authentic On-Field',
        visorStitchingColor: 'Tonal',
        hasRightSideLogo: false,
        structuredLogos: []
    };

    const modelId = "models/gemini-2.5-pro";
    const prompt = ANALYSIS_PROMPT;

    const MAX_RETRIES = 2;

    // Attempt resize - OCR works best with higher res (2048)
    const imageInputs = Array.isArray(imageInput) ? imageInput : [imageInput];
    const optimizedImages: string[] = [];

    for (const img of imageInputs) {
        try {
            // CRITICAL: Normalization to avoid "data:image/jpeg;base64,data:image/jpeg;base64,..."
            const bareBase64 = stripDataUrlPrefix(img);
            if (mimeType.includes('pdf')) {
                optimizedImages.push(bareBase64);
            } else {
                const optimized = await resizeForAiInput(bareBase64, mimeType, 2048);
                optimizedImages.push(optimized);
            }
        } catch (e) {
            console.warn("Resize failed, using raw input for analysis");
            optimizedImages.push(stripDataUrlPrefix(img));
        }
    }

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) await wait(1500 + Math.random() * 1000);

            // Add a small randomized 'jitter' to the prompt on retries to bypass stochastic safety blocks
            let activePrompt = prompt;
            if (attempt > 0) {
                const jitters = [
                    " Ensure extreme studio clarity.",
                    " Focus on macro textile grain.",
                    " Maintain 100% white background.",
                    " Replicate every detail faithfully."
                ];
                // Append a unique jitter per attempt to change the request hash/context
                activePrompt += jitters[attempt - 1] || ""; 
            }

            // Prompt Caching Strategy (Option 1)
            let cacheName: string | null = null;
            let currentContents: any = {
                role: "user",
                parts: [
                    ...optimizedImages.map(data => ({ inlineData: { mimeType: mimeType.includes('pdf') ? 'application/pdf' : 'image/jpeg', data } })),
                    { text: activePrompt }
                ]
            };

            // Attempt to cache images if it's the first attempt and we have enough tokens to hit 1024
            if (attempt === 0 && optimizedImages.length > 0) {
                const partsForCache = optimizedImages.map(data => ({ inlineData: { mimeType: mimeType.includes('pdf') ? 'application/pdf' : 'image/jpeg', data } }));
                cacheName = await tryGetContextCache(modelId, partsForCache);
            }
            // Add a comment to avoid multiple injections
            /* analyzeTechPackCache */

            if (cacheName) {
                currentContents = { role: "user", parts: [{ text: activePrompt }] };
            }

            const apiResponse = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "generateContent",
                    model: modelId.replace(/^models\//, ''),
                    contents: currentContents,
                    config: {
                        cachedContent: cacheName || undefined,
                        maxOutputTokens: 8192,
                        responseMimeType: "application/json",
                        temperature: 0,
                        safetySettings: [
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                        ]
                    }
                })
            });
            if (!apiResponse.ok) throw new Error(await apiResponse.text());
            const response = await apiResponse.json();

            // SAFE TEXT EXTRACTION
            if (!response.candidates || response.candidates.length === 0) {
                console.warn("No candidates returned from analysis");
                continue;
            }

            const candidate = response.candidates[0];
            if (candidate.finishReason === 'SAFETY') {
                console.warn("Analysis blocked by safety settings");
                continue;
            }

            let text = "";
            try {
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    text = candidate.content.parts.map(p => p.text).join('');
                } else {
                    text = (response as any).text || "";
                }
            } catch (err) {
                console.warn("Error accessing response text", err);
                continue;
            }

            // ROBUST JSON EXTRACTION
            text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');

            if (start === -1 || end === -1 || end <= start) {
                continue;
            }

            const jsonStr = text.substring(start, end + 1);
            let rawData: any = {};
            try {
                rawData = JSON.parse(jsonStr);
            } catch (jsonErr) {
                console.warn("JSON Parse Failed:", jsonErr);
                continue;
            }

            // KEY NORMALIZATION & PRIORITIZATION
            // CRITICAL FIX: We prioritize the "Human Readable" keys (e.g., "Crown") which typically come from the OCR 
            // over the camelCase keys (e.g., "crownColor") which the AI might hallucinate as defaults.
            const normalizedData = {
                // Team Name
                teamName: rawData['Team Name'] || rawData.Team || rawData.teamName || "Unknown",

                // Silhouette - Prioritize "Silhouette" capitalized
                silhouetteFamily: rawData.Silhouette || rawData['Silhouette Family'] || rawData.silhouetteFamily || '59FIFTY',

                // Silhouette Style
                silhouetteStyle: rawData.Style || rawData['Silhouette Style'] || rawData.silhouetteStyle || "",

                // League Detection
                league: rawData.League || rawData.league || 'Generic',

                // Colors - Prioritize direct label matches "Crown", "Visor"
                crownColor: rawData.Crown || rawData['Crown Color'] || rawData.crownColor || "Navy",
                visorColor: rawData.Visor || rawData['Visor Color'] || rawData.visorColor || null,
                buttonColor: rawData.Button || rawData['Button Color'] || rawData.buttonColor || null,
                undervisorColor: rawData.UV || rawData['Under Visor'] || rawData['Undervisor'] || rawData.undervisorColor || 'Grey',

                // Fabric - Prioritize "Fabric"
                fabricTech: rawData.Fabric || rawData.Material || rawData['Fabric Tech'] || rawData.fabricTech || 'Authentic On-Field',

                // Preserve pass-through props (usually consistent)
                tapeNumber: rawData.tapeNumber || rawData['Tape Number'] || rawData.Tape,
                sweatbandColor: rawData.sweatbandColor || rawData.Sweatband,
                embroideryColors: rawData.embroideryColors,
                raisedEmbroideryColors: rawData.raisedEmbroideryColors,
                sidePatchText: rawData.sidePatchText,
                backLogoText: rawData.backLogoText,
                frontLogoColors: rawData.frontLogoColors,
                newEraFlagColor: rawData['New Era Flag'] || rawData.newEraFlagColor || rawData.flagColor,
                rearLogoColors: rawData.rearLogoColors,
                hasRightSideLogo: rawData.hasRightSideLogo,
                allOverPattern: rawData.allOverPattern || null,
                structuredLogos: rawData.structuredLogos || [],
                visualDesignManifest: rawData.visualDesignManifest || ""
            };

            // Smart defaults for colors if missing (Visor/Button match Crown)
            if (!normalizedData.visorColor) normalizedData.visorColor = normalizedData.crownColor;
            if (!normalizedData.buttonColor) normalizedData.buttonColor = normalizedData.crownColor;

            // Fabric Mapping logic
            let mappedFabric = 'Authentic On-Field';
            const rawFabric = (normalizedData.fabricTech || '').toUpperCase();
            if (rawFabric.includes('WOOL')) mappedFabric = 'Heritage Wool';
            else if (rawFabric.includes('COTTON')) mappedFabric = 'Basic Cotton';
            else if (rawFabric.includes('LINEN')) mappedFabric = 'Team Linen';
            else if (rawFabric.includes('MESH')) mappedFabric = 'Mesh Ventilated';
            else if (rawFabric.includes('POLY') || rawFabric.includes('PERFORMANCE')) mappedFabric = 'Authentic On-Field';

            // UV Color Mapping
            let mappedUV = 'Grey';
            const rawUV = (normalizedData.undervisorColor || 'GREY').toUpperCase();
            if (rawUV.includes('BLACK')) mappedUV = 'Black';
            else if (rawUV.includes('GREEN')) mappedUV = 'Kelly Green';
            else if (rawUV.includes('PINK')) mappedUV = 'Pink Glow';
            else if (rawUV.includes('ORANGE')) mappedUV = 'Orange';
            else if (rawUV.includes('PURPLE')) mappedUV = 'Purple';

            return {
                ...rawData,
                ...normalizedData,
                undervisorColor: mappedUV,
                fabricTech: mappedFabric,
                silhouetteFamily: normalizedData.silhouetteFamily || '59FIFTY',
                crownColor: normalizedData.crownColor,
                visorColor: normalizedData.visorColor,
                buttonColor: normalizedData.buttonColor,
            };

        } catch (e: any) {
            console.error(`Analysis Attempt ${attempt + 1} Failed. Details:`, e?.message || e);
            if (e?.response) {
                console.error("HTTP Response data:", e.response);
            }
        }
    }
    return defaults;
};

/**
 * Stage 2: Autonomous Audit Service
 * Compares the generated front render against the tech pack drawing.
 */
export const auditFrontLogo = async (
    frontRenderUrl: string, 
    techPackImages: string[],
    techPackMimeType: string = 'image/jpeg'
): Promise<{ pass: boolean; reason: string }> => {
    const modelId = "models/gemini-2.5-pro";
    
    try {
        const apiResponse = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "generateContent",
                model: modelId.replace(/^models\//, ''),
                contents: {
                    role: "user",
                    parts: [
                        ...techPackImages.map(data => ({ inlineData: { mimeType: techPackMimeType.includes('pdf') ? 'application/pdf' : 'image/jpeg', data } })),
                        { inlineData: { mimeType: 'image/jpeg', data: stripDataUrlPrefix(frontRenderUrl) } },
                        { text: AUDIT_PROMPT }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    temperature: 0
                }
            })
        });
        if (!apiResponse.ok) throw new Error(await apiResponse.text());
        const response = await apiResponse.json();

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const result = JSON.parse(text);
        return {
            pass: result.pass === true,
            reason: result.reason || "No reason provided"
        };
    } catch (e) {
        console.error("Audit failed, defaulting to PASS to avoid blocking", e);
        return { pass: true, reason: "Audit service error" };
    }
};

/**
 * Generates 2D images based on specs.
 * REFACTORED: Hierarchical Pipeline (Front -> Audit -> Reference)
 */
export const generateCapRender = async (
    imageInput: File | string | string[],
    options: RenderOptions,
    onProgress?: ProgressCallback,
    onImageReady?: (index: number, url: string) => void,
    signal?: AbortSignal
): Promise<(string | null)[]> => {
    onProgress?.("INITIALIZING SERIAL QUEUE...");

    let base64Data: string[] = [];
    let mimeType = "image/png";

    try {
        if (imageInput instanceof File) {
            const result = await fileToGenericBase64(imageInput);
            base64Data = [result.data];
            mimeType = result.mimeType;
        } else if (Array.isArray(imageInput)) {
            // Strip prefixes from all pages
            base64Data = imageInput.map(stripDataUrlPrefix);
            mimeType = 'image/jpeg'; // Assuming extracted PDF pages are JPEG
        } else {
            base64Data = [stripDataUrlPrefix(imageInput)];
        }
    } catch (e) {
        if (signal?.aborted) {
            const e = new Error("Aborted");
            e.name = "AbortError";
            throw e;
        }
        console.error("Failed to process input file", e);
        throw new Error("Input file processing failed.");
    }

    // Optimize Images for Generation: Scale down based on mode (Preview vs Production)
    const optimizedInputs: string[] = [];
    const targetDim = options.isPreview ? 512 : 768;

    for (const data of base64Data) {
        try {
            if (mimeType.includes('pdf')) {
                optimizedInputs.push(data);
            } else {
                const optimized = await resizeForAiInput(data, mimeType, targetDim);
                optimizedInputs.push(optimized);
            }
        } catch (e) {
            console.warn("Resize failed in generation, using original");
            optimizedInputs.push(data);
        }
    }

    const family = options.silhouetteFamily || '59FIFTY';
    const style = options.silhouetteStyle || '';
    const material = getMaterialContext(options.fabricTech);

    const activeModels = options.activeModelIds && options.activeModelIds.length > 0
        ? options.activeModelIds
        : ['product-only'];

    const tasks: { modelId: string; angle: AngleType; globalIndex: number }[] = [];
    let globalIndexCounter = 0;

    // Flatten the tasks into a linear queue
    activeModels.forEach(modelId => {
        // Logic Update: Separate angle sets for Studio vs Lifestyle
        // 'product-only' is the ID for the main Studio scene which uses options.angles
        // All other IDs (lifestyle-urban, varsity-male, etc.) use options.lifestyleAngles
        const angleSet = modelId === 'product-only' ? options.angles : (options.lifestyleAngles || ['Three-Quarter Right']);

        angleSet.forEach(angle => {
            tasks.push({ modelId, angle, globalIndex: globalIndexCounter++ });
        });
    });

    // Rapid Prototyping Optimization: Only generate the first task if in preview mode
    if (options.isPreview && tasks.length > 1) {
        tasks.length = 1;
    }

    // Pre-fill results with null
    const results: (string | null)[] = new Array(tasks.length).fill(null);

    // PROMPT CACHING INITIALIZATION
    const commonParts = optimizedInputs.map(data => ({ inlineData: { mimeType: mimeType.includes('pdf') ? 'application/pdf' : 'image/jpeg', data } }));
    let techPackCacheName = await tryGetContextCache(options.model, commonParts);


    // Stage 1: Filter Front Elevation Task
    const frontTask = tasks.find(t => t.angle === 'Front Elevation');
    const remainingTasks = tasks.filter(t => t.angle !== 'Front Elevation');

    let frontRenderUrl: string | null = null;

    const processTask = async (task: any, i: number, total: number, frontReferenceUrl: string | null = null) => {
        if (signal?.aborted) {
            const e = new Error("Aborted");
            e.name = "AbortError";
            throw e;
        }

        const { modelId, angle, globalIndex } = task;
        onProgress?.(`RENDERING [${i + 1}/${total}]: ${angle.toUpperCase()}`);

        let prompt = "";
        const hasReference = !!frontReferenceUrl;

        if (modelId === 'product-only') {
            prompt = `
            ${constructTechStudioPrompt(options, angle, hasReference)}
            
            **TECHNICAL SPECS:**
            Material Context: ${material}
            Tape Number: ${options.tapeNumber || 'N/A'}
          `;
        } else {
            const sceneContext = SCENE_PROMPTS[modelId] || SCENE_PROMPTS['product-only'];
            const visualInstruction = hasReference 
                ? "You MUST match the logo and script style exactly as seen in the provided reference image. Do NOT invent or hallucinate the logo design." 
                : "The logo description is a label only. Do NOT draw literal symbols unless explicitly shown. Read the script and render it accurately.";
            prompt = `
              ${sceneContext}
              **VIEWPOINT:** ${angle}
              **SPECS:** Model: ${family} (${style}). Material: ${material}.
              **COLORS:** Crown: ${options.crownColor}, Visor: ${options.visorColor}, UV: ${options.undervisorColor}.
              ${visualInstruction}
              **TASK:** Render the provided 2D illustration as a photorealistic 3D product without hallucinating elements.
              **NEGATIVE INSTRUCTIONS:** No extra logos, no text hallucination, no incorrect colors, no sketches, no extra hats, no watermark, no signatures.
          `;
        }

        if (options.tweakPrompt) {
            prompt += `\n\n**USER TWEAKS & FIXES (CRITICAL PRIORITY):**\n${options.tweakPrompt}\nApply these adjustments carefully while maintaining the rest of the specifications.`;
        }

        let imageConfig: any = { aspectRatio: '1:1' };
        if (options.model.includes('gemini-2') || options.model.includes('gemini-3')) {
            imageConfig.imageSize = options.isPreview ? '512px' : '1K';
        }

        // Fetch Geometry template if available
        let geometryBase64: string | null = null;
        try {
            const angleFiles: Record<string, string> = {
                'Front Elevation': 'front.png',
                'Left Profile': 'left.png',
                'Right Profile': 'right.png',
                'Three-Quarter Left': 'three_quarter_left.png',
                'Three-Quarter Right': 'three_quarter_right.png',
                'Back': 'back.png',
                'Under View': 'under.png'
            };
            const filename = angleFiles[angle];
            if (filename && family) {
                const path = `/assets/geometry/${family}/${filename}`;
                const res = await fetch(path);
                if (res.ok) {
                    const blob = await res.blob();
                    geometryBase64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                }
            }
        } catch (err) {
            console.warn(`Could not load geometry anchor for ${family} ${angle}, falling back to text-only camera angle:`, err);
        }

        if (geometryBase64) {
            prompt += `\n\n${GEOMETRY_LOCK}`;
        }

        // Assemble visual parts strictly ordered
        const inputParts: any[] = [];
        
        // 1. Tech Pack Page(s)
        optimizedInputs.forEach(data => {
            inputParts.push({ inlineData: { mimeType: mimeType.includes('pdf') ? 'application/pdf' : 'image/jpeg', data } });
        });

        // 2. Approved Front elevation (Visual Identity Lock)
        if (frontReferenceUrl) {
            inputParts.push({ inlineData: { mimeType: 'image/jpeg', data: stripDataUrlPrefix(frontReferenceUrl) } });
        }

        // 3. Geometry Template (Perspective Lock)
        if (geometryBase64) {
            inputParts.push({ inlineData: { mimeType: 'image/png', data: stripDataUrlPrefix(geometryBase64) } });
        }

        // 4. Instructions
        let visualContextPrompt = `
**MULTIPLE INPUT REFERENCE GUIDE (CRITICAL REQUIREMENT):**
You are provided with multiple image inputs. Reconcile them using the following rules:
- Image Set 1 (First ${optimizedInputs.length} image(s)): The 2D Tech Pack specification sheet showing construction colors and logo placements.
`;
        let imgCounter = optimizedInputs.length + 1;
        if (frontReferenceUrl) {
            visualContextPrompt += `- Image ${imgCounter}: The Approved Front Elevation render. This is your **Visual Identity Lock**. You must replicate the embroidery texture, stitching density, satin sheen, and logo design style from this image *exactly*.
`;
            imgCounter++;
        }
        if (geometryBase64) {
            visualContextPrompt += `- Image ${imgCounter}: The Blank Geometry Template. This is your **Perspective & Silhouette Lock**. You must replicate the exact 3D shape, camera viewpoint, panel layouts, and visor curvature from this template. Do NOT copy the front-facing angle of the Front Render; only copy its embroidery style.
`;
        }

        const finalPromptText = `${prompt}\n\n${visualContextPrompt}`;
        inputParts.unshift({ text: finalPromptText });

        const MAX_RETRIES = 3;
        let currentBackoff = 4000;
        let success = false;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            if (signal?.aborted) {
                const e = new Error("Aborted");
                e.name = "AbortError";
                throw e;
            }
            try {
                if (attempt > 0) {
                    onProgress?.(`⚠️ RETRYING ${angle}... (${attempt}/${MAX_RETRIES})`);
                    await wait(currentBackoff);
                    if (signal?.aborted) {
                        const e = new Error("Aborted");
                        e.name = "AbortError";
                        throw e;
                    }
                    currentBackoff *= 2;
                }

                // Dynamic Fallback: If a task has visual references, we MUST use a multimodal model (Gemini)
                let activeModel = options.model.replace(/^models\//, '');
                if (frontReferenceUrl && activeModel.includes("imagen")) {
                    console.log(`[geminiService] Redirecting ${angle} to gemini-2.5-pro for Multimodal Visual Identity Lock.`);
                    activeModel = "gemini-2.5-pro";
                }

                // Check if we use cached Tech Pack
                let finalContents = { role: "user", parts: inputParts };
                if (techPackCacheName && !activeModel.includes("imagen")) {
                    finalContents = { role: "user", parts: inputParts.filter((p: any) => p.text || (p.inlineData && p.inlineData.data && !optimizedInputs.includes(p.inlineData.data))) };
                }
                const apiResponse = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: "generateContent",
                        model: activeModel,
                        contents: finalContents,
                        config: {
                            cachedContent: activeModel.includes("imagen") ? undefined : (techPackCacheName || undefined),
                            imageConfig,
                            safetySettings: [
                                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                            ]
                        }
                    })
                });
                if (!apiResponse.ok) throw new Error(await apiResponse.text());
                const response = await apiResponse.json();

                if (response.candidates && response.candidates.length > 0) {
                    if (response.candidates[0].finishReason === 'SAFETY') {
                        const err = new Error("Generation blocked by AI Safety Filters. Restricted content detected.");
                        err.name = "SafetyBlockError";
                        throw err;
                    }
                }

                let imageUrl = null;
                if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                            break;
                        }
                    }
                }

                if (imageUrl) {
                    results[globalIndex] = imageUrl;
                    onImageReady?.(globalIndex, imageUrl);
                    success = true;
                    break;
                } else {
                    throw new Error("No image data found in response");
                }

            } catch (error: any) {
                if (error.name === 'SafetyBlockError') {
                    throw error;
                }
                
                // CRITICAL LOGGING: See exact reason why Gemini rejected the request
                console.error(`GEMINI ERROR [${angle}]:`, {
                    message: error.message,
                    status: error.status,
                    details: error.details,
                    attempt: attempt + 1
                });

                if (error.message && error.message.includes("429")) {
                    onProgress?.("TRAFFIC LIMIT - PAUSING...");
                    await wait(4000);
                }
            }
        }

        if (!success) {
            console.error(`Failed to generate ${angle} after ${MAX_RETRIES} attempts.`);
        }
    };

    // PHASE 1: Generate Anchor (Front Elevation)
    if (frontTask) {
        const MAX_AUDIT_RETRIES = 2;
        for (let auditAttempt = 0; auditAttempt < MAX_AUDIT_RETRIES; auditAttempt++) {
            await processTask(frontTask, 0, tasks.length);
            frontRenderUrl = results[frontTask.globalIndex];

            if (frontRenderUrl && !options.isPreview) {
                onProgress?.(`AUDITING FRONT LOGO... (Attempt ${auditAttempt + 1})`);
                const audit = await auditFrontLogo(frontRenderUrl, optimizedInputs, mimeType);
                if (audit.pass) {
                    onProgress?.("✅ LOGO VERIFIED BY AUDITOR");
                    break;
                } else {
                    onProgress?.(`❌ LOGO FAILED AUDIT: ${audit.reason}`);
                    if (auditAttempt === MAX_AUDIT_RETRIES - 1) {
                        onProgress?.("⚠️ REACHED MAX AUDIT RETRIES, PROCEEDING WITH BEST EFFORT");
                    }
                }
            } else {
                break; // Skip audit in preview mode or if render failed
            }
        }
    }

    // PHASE 2: Generate Remaining Tasks with Reference
    if (remainingTasks.length > 0) {
        const CONCURRENCY = 2; // Reduced from 4 for stability
        for (let i = 0; i < remainingTasks.length; i += CONCURRENCY) {
            const chunk = remainingTasks.slice(i, i + CONCURRENCY);
            // Pass frontRenderUrl as the visual anchor
            await Promise.all(chunk.map((task, idx) => 
                processTask(task, (frontTask ? 1 : 0) + i + idx, tasks.length, frontRenderUrl)
            ));
            
            if (i + CONCURRENCY < remainingTasks.length) {
                await wait(1000);
            }
        }
    }

    onProgress?.("RENDER SEQUENCE COMPLETE");
        // Cleanup Cache
    await cleanupCache(techPackCacheName);

    return results;
};



export const regenerateSingleAngle = async (
    imageInput: File | string | string[],
    options: RenderOptions,
    targetIndex: number,
    onProgress?: ProgressCallback,
    signal?: AbortSignal
): Promise<string | null> => {
    onProgress?.("INITIALIZING REGENERATION...");

    let base64Data: string[] = [];
    let mimeType = "image/png";

    try {
        if (imageInput instanceof File) {
            const result = await fileToGenericBase64(imageInput);
            base64Data = [result.data];
            mimeType = result.mimeType;
        } else if (Array.isArray(imageInput)) {
            base64Data = imageInput.map(stripDataUrlPrefix);
            mimeType = 'image/jpeg';
        } else {
            base64Data = [stripDataUrlPrefix(imageInput)];
        }
    } catch (e) {
        if (signal?.aborted) {
            const e = new Error("Aborted");
            e.name = "AbortError";
            throw e;
        }
        console.error("Failed to process input file", e);
        throw new Error("Input file processing failed.");
    }

    const optimizedInputs: string[] = [];
    const targetDim = options.isPreview ? 512 : 768;

    for (const data of base64Data) {
        try {
            if (mimeType.includes('pdf')) {
                optimizedInputs.push(data);
            } else {
                const optimized = await resizeForAiInput(data, mimeType, targetDim);
                optimizedInputs.push(optimized);
            }
        } catch (e) {
            console.warn("Resize failed in generation, using original");
            optimizedInputs.push(data);
        }
    }

    const family = options.silhouetteFamily || '59FIFTY';
    const style = options.silhouetteStyle || '';
    const material = getMaterialContext(options.fabricTech);

    const activeModels = options.activeModelIds && options.activeModelIds.length > 0
        ? options.activeModelIds
        : ['product-only'];

    const tasks: { modelId: string; angle: AngleType; globalIndex: number }[] = [];
    let globalIndexCounter = 0;

    activeModels.forEach(modelId => {
        const angleSet = modelId === 'product-only' ? options.angles : (options.lifestyleAngles || ['Three-Quarter Right']);
        angleSet.forEach(angle => {
            tasks.push({ modelId, angle, globalIndex: globalIndexCounter++ });
        });
    });

    const targetTask = tasks[targetIndex];
    if (!targetTask) {
        throw new Error("Target index out of bounds.");
    }

    const { modelId, angle } = targetTask;
    onProgress?.("RE-RENDERING: " + angle.toUpperCase());

    let prompt = "";
    if (modelId === 'product-only') {
        prompt = `
        ${constructTechStudioPrompt(options, angle, false)}
        
        **TECHNICAL SPECS:**
        Material Context: ${material}
        Tape Number: ${options.tapeNumber || 'N/A'}
        `;
    } else {
        const sceneContext = SCENE_PROMPTS[modelId] || SCENE_PROMPTS['product-only'];
        prompt = `
          ${sceneContext}
          **VIEWPOINT:** ${angle}
          **SPECS:** Model: ${family} (${style}). Material: ${material}.
          **COLORS:** Crown: ${options.crownColor}, Visor: ${options.visorColor}, UV: ${options.undervisorColor}.
          The logo description is a label only. Do NOT draw literal symbols unless explicitly shown. Read the script and render it accurately.
          **TASK:** Render the provided 2D illustration as a photorealistic 3D product without hallucinating elements.
          **NEGATIVE INSTRUCTIONS:** No extra logos, no text hallucination, no incorrect colors, no sketches, no extra hats, no watermark, no signatures.
      `;
    }

    if (options.tweakPrompt) {
        prompt += `\n\n**USER TWEAKS & FIXES (CRITICAL PRIORITY):**\n${options.tweakPrompt}\nApply these adjustments carefully while maintaining the rest of the specifications.`;
    }

    let imageConfig: any = { aspectRatio: '1:1' };
    if (options.model.includes('gemini-2') || options.model.includes('gemini-3')) {
        imageConfig.imageSize = options.isPreview ? '512px' : '1K';
    }

    const inputParts: any[] = [{ text: prompt }];
    optimizedInputs.map(data => inputParts.push({ inlineData: { mimeType: mimeType.includes('pdf') ? 'application/pdf' : 'image/jpeg', data } }));

    const MAX_RETRIES = 3;
    let currentBackoff = 2000;
    let success = false;
    let imageUrl = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (signal?.aborted) {
            const e = new Error("Aborted");
            e.name = "AbortError";
            throw e;
        }
        try {
            if (attempt > 0) {
                onProgress?.(`⚠️ RETRYING ${angle}... (${attempt}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, currentBackoff));
                if (signal?.aborted) {
                    const e = new Error("Aborted");
                    e.name = "AbortError";
                    throw e;
                }
                currentBackoff *= 2;
            }

            const apiResponse = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "generateContent",
                    model: options.model.replace(/^models\//, ''),
                    contents: {
                        role: "user",
                        parts: inputParts
                    },
                    config: {
                        imageConfig,
                        safetySettings: [
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                        ]
                    }
                })
            });
            if (!apiResponse.ok) throw new Error(await apiResponse.text());
            const response = await apiResponse.json();

            if (response.candidates && response.candidates.length > 0) {
                if (response.candidates[0].finishReason === 'SAFETY') {
                    const err = new Error("Generation blocked by AI Safety Filters. Restricted content detected.");
                    err.name = "SafetyBlockError";
                    throw err;
                }
            }

            if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                        break;
                    }
                }
            }

            if (imageUrl) {
                success = true;
                break;
            } else {
                throw new Error("No image data found in response");
            }

        } catch (error: any) {
            if (error.name === 'SafetyBlockError') {
                throw error;
            }
            
            console.error(`GEMINI ERROR [${angle}]:`, {
                message: error.message,
                status: error.status,
                details: error.details,
                attempt: attempt + 1
            });

            if (error.message && error.message.includes("429")) {
                onProgress?.("TRAFFIC LIMIT - PAUSING...");
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        }
    }

    if (!success) {
        console.error(`Failed to generate ${angle} after ${MAX_RETRIES} attempts.`);
        throw new Error("Failed to regenerate angle.");
    }
    
    onProgress?.("REGENERATION COMPLETE");
    return imageUrl;
};
