let pdfjsInstance: any = null;

const getPdfJs = async () => {
  if (typeof window === 'undefined') return null;
  if (pdfjsInstance) return pdfjsInstance;

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsInstance = (pdfjsLib as any).default || pdfjsLib;
  pdfjsInstance.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  return pdfjsInstance;
};

interface ConversionOptions {
    scale?: number;
    maxWidth?: number; // New optimization param
    quality?: number;  // JPEG quality (0 to 1)
    format?: 'image/png' | 'image/jpeg';
}

// Helper to read File as ArrayBuffer safely using FileReader 
// (Bypasses potential Blob.arrayBuffer() -> new Response() issues)
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to read file as ArrayBuffer"));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
};

export const convertPdfPageToImage = async (
    file: File, 
    pageNumber: number = 1, 
    optionsOrScale: number | ConversionOptions = 2.0
): Promise<string> => {
  const pdfjs = await getPdfJs();
  if (!pdfjs) throw new Error("PDF processing is only supported in browser environments.");
  
  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  let config: ConversionOptions = {
      scale: 2.0,
      quality: 1.0,
      format: 'image/png'
  };

  if (typeof optionsOrScale === 'number') {
      config.scale = optionsOrScale;
  } else {
      config = { ...config, ...optionsOrScale };
  }
  
  try {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    if (pageNumber > pdf.numPages) {
      throw new Error(`Page ${pageNumber} out of bounds (${pdf.numPages} total)`);
    }

    const page = await pdf.getPage(pageNumber);
    let finalScale = config.scale || 2.0;
    
    if (config.maxWidth) {
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const calculatedScale = config.maxWidth / unscaledViewport.width;
        finalScale = Math.min(calculatedScale, 4.0); 
    }

    const viewport = page.getViewport({ scale: finalScale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) throw new Error('Could not create canvas context');

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    return canvas.toDataURL(config.format || 'image/png', config.quality);

  } catch (error) {
    console.error("PDF Rasterization failed:", error);
    throw new Error("Failed to process PDF. Ensure it is a valid PDF file.");
  }
};

/**
 * Extracts each page of a PDF as a separate base64 image string.
 * This is crucial for multi-page Tech Pack analysis to maintain high resolution for OCR.
 */
export const convertPdfToPageImages = async (
    file: File, 
    optionsOrScale: number | ConversionOptions = 2.0
): Promise<string[]> => {
  const pdfjs = await getPdfJs();
  if (!pdfjs) throw new Error("PDF processing is only supported in browser environments.");

  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  let config: ConversionOptions = {
      scale: 2.0,
      quality: 0.85, // Optimized for Gemini OCR
      format: 'image/jpeg'
  };

  if (typeof optionsOrScale === 'number') {
      config.scale = optionsOrScale;
  } else {
      config = { ...config, ...optionsOrScale };
  }
  
  try {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const pageImages: string[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        let finalScale = config.scale || 2.0;
        
        // If maxWidth is provided, dynamically scale each page to fit
        if (config.maxWidth) {
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const calculatedScale = config.maxWidth / unscaledViewport.width;
            finalScale = Math.min(calculatedScale, 4.0); 
        }
        
        const viewport = page.getViewport({ scale: finalScale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            pageImages.push(canvas.toDataURL(config.format || 'image/jpeg', config.quality));
        }
    }

    return pageImages;

  } catch (error) {
    console.error("PDF page extraction failed:", error);
    throw new Error("Failed to process PDF pages.");
  }
};

export const convertFullPdfToImage = async (
    file: File, 
    optionsOrScale: number | ConversionOptions = 2.0
): Promise<string> => {
  const pdfjs = await getPdfJs();
  if (!pdfjs) throw new Error("PDF processing is only supported in browser environments.");

  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  let config: ConversionOptions = {
      scale: 2.0,
      quality: 1.0,
      format: 'image/png'
  };

  if (typeof optionsOrScale === 'number') {
      config.scale = optionsOrScale;
  } else {
      config = { ...config, ...optionsOrScale };
  }
  
  try {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    let totalHeight = 0;
    let maxWidth = 0;
    const pageViewports = [];
    
    // Calculate total dimensions
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        let finalScale = config.scale || 2.0;
        
        if (config.maxWidth) {
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const calculatedScale = config.maxWidth / unscaledViewport.width;
            finalScale = Math.min(calculatedScale, 4.0); 
        }
        
        const viewport = page.getViewport({ scale: finalScale });
        totalHeight += viewport.height;
        maxWidth = Math.max(maxWidth, viewport.width);
        pageViewports.push({ page, viewport });
    }

    // Create master canvas for stitched image
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) throw new Error('Could not create canvas context');

    canvas.width = maxWidth;
    canvas.height = totalHeight;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Render each page to an intermediate canvas and draw onto master
    let currentY = 0;
    for (const { page, viewport } of pageViewports) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const tempContext = tempCanvas.getContext('2d');
        
        if (tempContext) {
            tempContext.fillStyle = '#FFFFFF';
            tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            await page.render({
                canvasContext: tempContext,
                viewport: viewport
            }).promise;
            
            context.drawImage(tempCanvas, 0, currentY);
        }
        currentY += viewport.height;
    }

    return canvas.toDataURL(config.format || 'image/png', config.quality);

  } catch (error) {
    console.error("PDF Rasterization failed:", error);
    throw new Error("Failed to process PDF. Ensure it is a valid PDF file.");
  }
};