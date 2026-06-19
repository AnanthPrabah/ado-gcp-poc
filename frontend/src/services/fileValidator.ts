/**
 * fileValidator.ts
 * Centralised validation for Tech Pack file uploads.
 * Returns a human-readable error string, or null if the file is valid.
 */

const ACCEPTED_MIME_TYPES = ['application/pdf'];
const ACCEPTED_EXTENSIONS = ['.pdf'];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Reads the first N bytes of a File without loading the whole thing. */
const readFirstBytes = (file: File, n: number): Promise<Uint8Array> =>
    new Promise((resolve, reject) => {
        const slice = file.slice(0, n);
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(slice);
    });

/** Returns true if the first bytes match the PDF magic number (%PDF-). */
const isPdfMagicValid = async (file: File): Promise<boolean> => {
    try {
        const bytes = await readFirstBytes(file, 5);
        // %PDF- in ASCII → [37, 80, 68, 70, 45]
        return bytes[0] === 0x25 &&
               bytes[1] === 0x50 &&
               bytes[2] === 0x44 &&
               bytes[3] === 0x46 &&
               bytes[4] === 0x2D;
    } catch {
        return false;
    }
};

export interface ValidationResult {
    valid: boolean;
    error: string | null;
}

/**
 * Validates a file for Tech Pack upload.
 * Checks: type, extension, emptiness, size, and PDF magic bytes.
 */
export const validateTechPackFile = async (file: File): Promise<ValidationResult> => {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    // 1. File type / extension check
    const isValidType = ACCEPTED_MIME_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext);
    if (!isValidType) {
        return {
            valid: false,
            error: `Invalid file type "${ext || file.type || 'unknown'}". Only PDF files are accepted.`,
        };
    }

    // 2. Empty file check
    if (file.size === 0) {
        return {
            valid: false,
            error: 'The file appears to be empty (0 bytes). Please check the file and try again.',
        };
    }

    // 3. Size limit check
    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        return {
            valid: false,
            error: `File too large: ${sizeMB} MB. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`,
        };
    }

    // 4. PDF magic-byte check (detects renamed or corrupted files)
    const magicOk = await isPdfMagicValid(file);
    if (!magicOk) {
        return {
            valid: false,
            error: `"${file.name}" does not appear to be a valid PDF. The file may be corrupted or renamed.`,
        };
    }

    return { valid: true, error: null };
};

/**
 * Validates that the extracted Tech Pack data contains all required manufacturing specification values.
 * If any values are missing, empty, or fallback defaults ("Unknown", "--"), the PDF is considered invalid.
 */
export const validateTechPackData = (data: any): { valid: boolean; error: string | null } => {
    const requiredFields: { key: string; label: string }[] = [
        { key: "teamName", label: "Team Name" },
        { key: "silhouetteFamily", label: "Silhouette Family" },
        { key: "silhouetteStyle", label: "Silhouette Style" },
        { key: "crownColor", label: "Crown Color" },
        { key: "visorColor", label: "Visor Color" },
        { key: "buttonColor", label: "Button Color" },
        { key: "undervisorColor", label: "Undervisor Color" },
        { key: "fabricTech", label: "Fabric Tech" },
        { key: "sweatbandColor", label: "Sweatband Color" },
        { key: "newEraFlagColor", label: "New Era Flag Color" }    
    ];

    const missingLabels = requiredFields
        .filter(field => {
            const val = data[field.key];
            return val === undefined || val === null || val === "" || val === "Unknown" || val === "--";
        })
        .map(field => field.label);

    if (missingLabels.length > 0) {
        return {
            valid: false,
            error: `Invalid Tech Pack PDF: Could not extract required manufacturing specifications: ${missingLabels.join(', ')}. Please ensure the document is clear and contains complete specifications.`,
        };
    }

    return { valid: true, error: null };
};

