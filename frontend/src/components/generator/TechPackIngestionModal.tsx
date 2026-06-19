import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { validateTechPackData, validateTechPackFile } from '../../services/fileValidator';
import { Scan, X, Zap, Loader2, Check, Info, Target, Cpu, Upload, FileText } from 'lucide-react';
import MetadataFieldCard, { getColorHex } from '../ui/MetadataFieldCard';
import { ThreadLayer, StructuredLogo, ExtractedMetadata } from '../../types/metadata';
import { useStudioStore } from '../../store/useStudioStore';

export type { ThreadLayer, StructuredLogo, ExtractedMetadata };

import { convertPdfPageToImage } from '@/src/services/pdfService';

// export const extractedData: ExtractedMetadata = {
//   teamName: 'Arizona Diamondbacks',
//   silhouetteFamily: '59FIFTY',
//   silhouetteStyle: 'Fitted',
//   fabricTech: 'Polyester',
//   crownColor: 'Black',
//   visorColor: 'Teal',
//   undervisorColor: 'Grey',
//   buttonColor: 'Teal',
//   visorStitchingColor: 'Black',
//   eyeletColor: 'Black',
//   sweatbandColor: 'Black',
//   newEraFlagColor: 'Teal',
//   structuredLogos: [
//     {
//       position: 'front',
//       designNumber: 'D-0021',
//       description: 'Arizona Diamondbacks primary wordmark with snake logo',
//       isRaised: true,
//       visualMapping: { fill: 'Red, Black, Teal', border: 'Gold' },
//       colorLayers: [
//         { index: 1, description: 'Red', pms: '187' },
//         { index: 2, description: 'Real Black', pms: 'BLACK' },
//         { index: 3, description: 'Calypso Green', pms: '319' },
//       ]
//     },
//     {
//       position: 'rear',
//       designNumber: 'D-0022',
//       description: 'New Era Flag',
//       isRaised: false,
//       visualMapping: { fill: 'Black', border: '' },
//       colorLayers: [
//         { index: 1, description: 'Real Black', pms: 'BLACK' },
//       ]
//     },
//     {
//       position: 'left-mid',
//       designNumber: 'D-0023',
//       description: 'Size flag label',
//       isRaised: false,
//       visualMapping: { fill: 'Black', border: '' },
//       colorLayers: [
//         { index: 1, description: 'Real Black', pms: 'BLACK' },
//       ]
//     }
//   ]
// };

interface TechPackIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  onComplete: () => void;
  imageSrc?: string;
}

export default function TechPackIngestionModal({
  isOpen,
  onClose,
  fileName,
  onComplete,
  imageSrc
}: TechPackIngestionModalProps) {
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const originalSourceFile = useStudioStore((state) => state.originalSourceFile);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    async function loadPreview() {
      if (!originalSourceFile) {
        setPdfPreviewUrl(null);
        return;
      }

      try {
        if (originalSourceFile.type === 'application/pdf') {
          console.log("Generating PDF preview inside modal for file:", originalSourceFile.name);
          const preview = await convertPdfPageToImage(originalSourceFile);
          if (active) {
            setPdfPreviewUrl(preview);
          }
        } else if (originalSourceFile.type.startsWith('image/')) {
          console.log("Generating image object URL inside modal for file:", originalSourceFile.name);
          objectUrl = URL.createObjectURL(originalSourceFile);
          if (active) {
            setPdfPreviewUrl(objectUrl);
          }
        } else {
          if (active) {
            setPdfPreviewUrl(null);
          }
        }
      } catch (error) {
        console.error('Error generating tech pack preview:', error);
        if (active) {
          setPdfPreviewUrl(null);
        }
      }
    }

    loadPreview();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [originalSourceFile]);

  useEffect(() => {
    setActiveFileName(fileName);
  }, [fileName]);

  useEffect(() => {
    if (!isOpen) {
      setActiveFileName(null);
      setIsDragActive(false);
      setPdfPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validation = await validateTechPackFile(file);
      if (!validation.valid) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: `File "${file.name}" is invalid: ${validation.error || 'Invalid file.'}`,
            type: 'error'
          }
        }));
        return;
      }
      setActiveFileName(file.name);
      const { handleImageSelect } = useStudioStore.getState();
      await handleImageSelect(file);
    }
  };
  
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setActiveFileName(e.target.files[0].name);
      console.log("File input change detected:", e.target.files[0]);

      const file = e.target.files[0];

      const { handleImageSelect } = useStudioStore.getState();      

      const techPackData = await handleImageSelect(file);  
             
      if (!techPackData){
        console.error("No data extracted from the tech pack.");
        return;
      }      
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const [ingestionProgress, setIngestionProgress] = useState(0);

  // Section Ingestion Statuses
  const [baseStatus, setBaseStatus] = useState<'waiting' | 'scanning' | 'complete'>('waiting');
  const [colorwayStatus, setColorwayStatus] = useState<'waiting' | 'scanning' | 'complete'>('waiting');
  const [brandingStatus, setBrandingStatus] = useState<'waiting' | 'scanning' | 'complete'>('waiting');

  const [selectedRenderAngles, setSelectedRenderAngles] = useState<string[]>([
    'FRONT ELEVATION',
    'THREE-QUARTER RIGHT',
    'THREE-QUARTER LEFT',
    'LEFT PROFILE',
    'RIGHT PROFILE',
    'REAR PROFILE',
    'UNDER VIEW'
  ]);

  const handleCancel = () => {
    if (activeFileName) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Tech pack analysis cancelled',
          type: 'warning'
        }
      }));
    }
    onClose();
  };

  const techPackData = useStudioStore(
    (state) => state.extractedData
  );

  const isAnalyzing = useStudioStore(
    (state) => state.isAnalyzing
  );

  const extractedData: ExtractedMetadata = {
    teamName: techPackData?.teamName || '',
    silhouetteFamily: techPackData?.silhouetteFamily || '',
    silhouetteStyle: techPackData?.silhouetteStyle || '',
    fabricTech: techPackData?.fabricTech || '',
    crownColor: techPackData?.crownColor || '',
    visorColor: techPackData?.visorColor || '',
    undervisorColor: techPackData?.undervisorColor || '',
    buttonColor: techPackData?.buttonColor || '',
    visorStitchingColor: techPackData?.visorStitchingColor || '',
    eyeletColor: techPackData?.eyeletColor || '',
    sweatbandColor: techPackData?.sweatbandColor || '',
    newEraFlagColor: techPackData?.newEraFlagColor || '',
  
    structuredLogos:
      techPackData?.structuredLogos?.map((logo) => ({
        position: logo.position,
        designNumber: logo.designNumber,
        description: logo.description,
        isRaised: logo.isRaised,
        visualMapping: {
          fill: logo.visualMapping?.fill || '',
          border: logo.visualMapping?.border || '',
        },
        colorLayers:
          logo.colorLayers?.map((layer) => ({
            index: layer.index,
            description: layer.description,
            pms: layer.pms,
          })) || [],
      })) || [],
  };

  const getLogosVisibleInAngle = (angle: string, logos: StructuredLogo[]): string[] => {
    const visibleLogos: string[] = [];
    logos.forEach(logo => {
      const pos = logo.position.toLowerCase().trim();
      const desc = logo.description || `${logo.position} logo`;
      
      if (angle === 'FRONT ELEVATION') {
        if (pos.includes('front')) visibleLogos.push(desc);
      } else if (angle === 'THREE-QUARTER RIGHT') {
        if (pos.includes('front') || pos.includes('right')) visibleLogos.push(desc);
      } else if (angle === 'THREE-QUARTER LEFT') {
        if (pos.includes('front') || pos.includes('left')) visibleLogos.push(desc);
      } else if (angle === 'LEFT PROFILE') {
        if (pos.includes('left')) visibleLogos.push(desc);
      } else if (angle === 'RIGHT PROFILE') {
        if (pos.includes('right')) visibleLogos.push(desc);
      } else if (angle === 'REAR PROFILE') {
        if (pos.includes('rear')) visibleLogos.push(desc);
      } else if (angle === 'UNDER VIEW') {
        if (pos.includes('under') || pos.includes('visor')) visibleLogos.push(desc);
      }
    });
    return visibleLogos;
  };

  const getVisibleAnglesForPosition = (position: string): string[] => {
    const pos = position.toLowerCase().trim();
    if (pos.includes('front')) {
      return ['Front Elevation', '3/4 Right', '3/4 Left'];
    }
    if (pos.includes('rear')) {
      return ['Rear Profile'];
    }
    if (pos.includes('left')) {
      return ['Left Profile', '3/4 Left'];
    }
    if (pos.includes('right')) {
      return ['Right Profile', '3/4 Right'];
    }
    if (pos.includes('under') || pos.includes('visor')) {
      return ['Under View'];
    }
    return ['N/A'];
  };

  const handleComplete = () => {
    const validation = validateTechPackData(extractedData);
    if (!validation.valid) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: validation.error || 'Invalid Tech Pack Data',
          type: 'error'
        }
      }));
      return;
    }

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: {
        message: 'Tech pack analysis completed successfully',
        type: 'success'
      }
    }));
    onComplete();
  };

  const toggleAngleSelection = (angle: string) => {
    setSelectedRenderAngles(prev => {
      const next = prev.includes(angle)
        ? prev.filter(a => a !== angle)
        : [...prev, angle];
      if (next.length === 0) return prev; // keep at least 1 angle
      localStorage.setItem('selectedRenderAngles', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setIngestionProgress(0);
      setBaseStatus('waiting');
      setColorwayStatus('waiting');
      setBrandingStatus('waiting');
      return;
    }

    // Set angles
    const allAngles = [
      'FRONT ELEVATION',
      'THREE-QUARTER RIGHT',
      'THREE-QUARTER LEFT',
      'LEFT PROFILE',
      'RIGHT PROFILE',
      'REAR PROFILE',
      'UNDER VIEW'
    ];
    setSelectedRenderAngles(allAngles);
    localStorage.setItem('selectedRenderAngles', JSON.stringify(allAngles));

    if (!activeFileName) {
      setIngestionProgress(0);
      setBaseStatus('waiting');
      setColorwayStatus('waiting');
      setBrandingStatus('waiting');
      return;
    }

    let intervalId: NodeJS.Timeout;
    let currentProgress = 0;

    if (isAnalyzing) {
      // Clear progress, start slow increment to 90%
      setIngestionProgress(0);
      setBaseStatus('scanning');
      setColorwayStatus('waiting');
      setBrandingStatus('waiting');

      intervalId = setInterval(() => {
        currentProgress += (90 - currentProgress) * 0.05; // Asymptotic approach to 90% over ~90 seconds
        if (currentProgress > 89.5) {
          currentProgress = 89.5;
        }
        setIngestionProgress(currentProgress);

        // Update staggered status (stagger start, but keep scanning until API finishes)
        if (currentProgress <= 30) {
          setBaseStatus('scanning');
          setColorwayStatus('waiting');
          setBrandingStatus('waiting');
        } else if (currentProgress > 30 && currentProgress <= 60) {
          setBaseStatus('scanning');
          setColorwayStatus('scanning');
          setBrandingStatus('waiting');
        } else {
          setBaseStatus('scanning');
          setColorwayStatus('scanning');
          setBrandingStatus('scanning');
        }
      }, 1000);
    } else {
      // isAnalyzing is false. If we have extracted data, complete the scan.
      if (techPackData) {
        setIngestionProgress(100);
        setBaseStatus('complete');
        setColorwayStatus('complete');
        setBrandingStatus('complete');
      } else {
        setIngestionProgress(0);
        setBaseStatus('waiting');
        setColorwayStatus('waiting');
        setBrandingStatus('waiting');
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, activeFileName, isAnalyzing, techPackData]);

  const renderBaseArchitecture = () => {
    const isScanning = baseStatus === 'scanning';

    return (
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${baseStatus === 'complete'
        ? 'border-slate-200 dark:border-white/10 bg-[#F8FAFC] dark:bg-bg-elevated'
        : 'border-slate-100 dark:border-white/5 bg-transparent'
        }`}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-150 dark:border-white/5 pb-2.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Cpu size={13} className="text-slate-400 dark:text-slate-600" />
            Base Architecture
          </span>
          {isScanning && <Loader2 size={12} className="animate-spin text-[#2563EB]" />}
          {baseStatus === 'complete' && (
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shrink-0 scale-90">
              <Check size={11} strokeWidth={3.5} />
            </span>
          )}
        </div>

        <div className="space-y-3">
          {[
            { label: 'TEAM NAME', value: extractedData.teamName },
            { label: 'FAMILY', value: extractedData.silhouetteFamily },
            { label: 'STYLE', value: extractedData.silhouetteStyle },
            { label: 'TEXTILE', value: extractedData.fabricTech }
          ].map((row, rIdx) => (
            <MetadataFieldCard
              key={rIdx}
              label={row.label}
              value={row.value}
              variant="row-item"
              status={baseStatus}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderColorwayMapping = () => {
    const isScanning = colorwayStatus === 'scanning';

    return (
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${colorwayStatus === 'complete'
        ? 'border-slate-200 dark:border-white/10 bg-[#F8FAFC] dark:bg-bg-elevated'
        : 'border-slate-100 dark:border-white/5 bg-transparent'
        }`}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-150 dark:border-white/5 pb-2.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Scan size={13} className="text-slate-400 dark:text-slate-600" />
            Colorway Mapping
          </span>
          {isScanning && <Loader2 size={12} className="animate-spin text-[#2563EB]" />}
          {colorwayStatus === 'complete' && (
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shrink-0 scale-90">
              <Check size={11} strokeWidth={3.5} />
            </span>
          )}
        </div>

        <div className="space-y-2 mt-1">
          {[
            { label: 'CROWN', value: extractedData.crownColor },
            { label: 'VISOR', value: extractedData.visorColor },
            { label: 'U-VISOR', value: extractedData.undervisorColor },
            { label: 'BUTTON', value: extractedData.buttonColor },
            { label: 'SWEATBAND', value: extractedData.sweatbandColor },
            { label: 'NEC FLAG', value: extractedData.newEraFlagColor }
          ].map((row, rIdx) => (
            <MetadataFieldCard
              key={rIdx}
              label={row.label}
              value={row.value}
              variant="row-item"
              status={colorwayStatus}
              isColor={true}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderBrandingSpecs = () => {
    const isScanning = brandingStatus === 'scanning';
    const isWaiting = brandingStatus === 'waiting';

    return (
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${brandingStatus === 'complete'
        ? 'border-slate-200 dark:border-white/10 bg-[#F8FAFC] dark:bg-bg-elevated'
        : 'border-slate-100 dark:border-white/5 bg-transparent'
        }`}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-150 dark:border-white/5 pb-2.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Target size={13} className="text-slate-400 dark:text-slate-600" />
            Branding Specs
          </span>
          {isScanning && <Loader2 size={12} className="animate-spin text-[#2563EB]" />}
          {brandingStatus === 'complete' && (
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shrink-0 scale-90">
              <Check size={11} strokeWidth={3.5} />
            </span>
          )}
        </div>

        <div className="space-y-6">
          {extractedData.structuredLogos.length === 0 && (brandingStatus === 'scanning' || brandingStatus === 'waiting') ? (
            ['FRONT', 'LEFT', 'REAR'].map((position, itemIdx) => (
              <div key={itemIdx} className="border-t first:border-t-0 border-slate-200/40 dark:border-white/5 pt-5 first:pt-0 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wider animate-pulse">{position} Placement</span>
                  <div className={`w-16 h-5 rounded animate-pulse ${
                    isScanning ? 'bg-[#2563EB]/10 dark:bg-white/10' : 'bg-slate-200/60 dark:bg-white/5'
                  }`} />
                </div>

                <div className="space-y-3 pl-1">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider">TREATMENT</span>
                    <div className={`w-32 h-6 rounded animate-pulse ${
                      isScanning ? 'bg-[#2563EB]/10 dark:bg-white/10' : 'bg-slate-200/50 dark:bg-white/5'
                    }`} />
                  </div>

                  <div className="flex justify-between items-start text-[13px] gap-4">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider">DESCRIPTION</span>
                    <div className={`w-44 h-5.5 rounded animate-pulse ${
                      isScanning ? 'bg-[#2563EB]/10 dark:bg-white/10' : 'bg-slate-200/50 dark:bg-white/5'
                    }`} />
                  </div>

                  <div className="flex justify-between items-start text-[13px] gap-4 pt-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider">COLOR LAYERS</span>
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-[75%]">
                      <div className={`w-48 h-6 rounded animate-pulse ${
                        isScanning ? 'bg-[#2563EB]/10 dark:bg-white/10' : 'bg-slate-200/50 dark:bg-white/5'
                      }`} />
                    </div>
                  </div>

                  <div className="flex justify-between items-start text-[13px] gap-4 pt-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider">VISIBLE IN VIEWS</span>
                    <div className={`w-36 h-5.5 rounded animate-pulse ${
                      isScanning ? 'bg-[#2563EB]/10 dark:bg-white/10' : 'bg-slate-200/50 dark:bg-white/5'
                    }`} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            extractedData.structuredLogos.map((logo, logoIdx) => (
              <div key={logoIdx} className="border-t first:border-t-0 border-slate-200/40 dark:border-white/5 pt-5 first:pt-0 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">{logo.position} Placement</span>
                  {isWaiting ? (
                    <div className="w-16 h-5 bg-slate-200/60 dark:bg-white/5 animate-pulse rounded" />
                  ) : isScanning ? (
                    <div className="w-16 h-5 bg-[#2563EB]/10 dark:bg-white/10 animate-pulse rounded" />
                  ) : (
                    <span className="font-mono text-[11px] bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-350 px-2.5 py-0.5 rounded font-bold animate-in fade-in duration-300">{logo.designNumber}</span>
                  )}
                </div>

                <div className="space-y-3 pl-1">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider">TREATMENT</span>
                    {isWaiting ? (
                      <div className="w-32 h-6 bg-slate-200/50 dark:bg-white/5 animate-pulse rounded" />
                    ) : isScanning ? (
                      <div className="w-32 h-6 bg-[#2563EB]/10 dark:bg-white/10 animate-pulse rounded" />
                    ) : (
                      <span className="font-bold text-slate-800 dark:text-white text-[11.5px] uppercase tracking-wide bg-slate-200/60 dark:bg-white/10 px-2.5 py-1 rounded animate-in zoom-in duration-300">{logo.isRaised ? 'Raised Embroidery' : 'Flat Embroidery'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-start text-[13px] gap-4">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider">DESCRIPTION</span>
                    {isWaiting ? (
                      <div className="w-44 h-5.5 bg-slate-200/50 dark:bg-white/5 animate-pulse rounded" />
                    ) : isScanning ? (
                      <div className="w-44 h-5.5 bg-[#2563EB]/10 dark:bg-white/10 animate-pulse rounded" />
                    ) : (
                      <span className="font-medium text-slate-700 dark:text-slate-200 text-right text-[12.5px] leading-relaxed max-w-[70%] animate-in fade-in duration-300" title={logo.description}>{logo.description}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-start text-[13px] gap-4 pt-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider">COLOR LAYERS</span>
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-[75%]">
                      {isWaiting ? (
                        <div className="w-48 h-6 bg-slate-200/50 dark:bg-white/5 animate-pulse rounded" />
                      ) : isScanning ? (
                        <div className="w-48 h-6 bg-[#2563EB]/10 dark:bg-white/10 animate-pulse rounded" />
                      ) : (
                        logo.colorLayers.map((layer, lIdx) => (
                          <span key={lIdx} className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-200/60 dark:bg-white/10 border border-slate-300/40 dark:border-white/5 text-slate-700 dark:text-slate-300 animate-in zoom-in duration-300">
                            <span className="h-1.5 w-1.5 rounded-full shadow-sm" style={{ backgroundColor: getColorHex(layer.pms) }} />
                            {layer.description} ({layer.pms})
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-start text-[13px] gap-4 pt-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold tracking-wider">VISIBLE IN VIEWS</span>
                    {isWaiting ? (
                      <div className="w-36 h-5.5 bg-slate-200/50 dark:bg-white/5 animate-pulse rounded" />
                    ) : isScanning ? (
                      <div className="w-36 h-5.5 bg-[#2563EB]/10 dark:bg-white/10 animate-pulse rounded" />
                    ) : (
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-right text-[11px] uppercase tracking-wide leading-relaxed animate-in fade-in duration-300">
                        {getVisibleAnglesForPosition(logo.position).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 dark:bg-black/75 backdrop-blur-[6px]"
        >
          <motion.div
            initial={{ scale: 0.96, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`relative w-full max-h-[90vh] md:max-h-[85vh] overflow-hidden rounded-2xl border border-border-primary dark:border-white/10 bg-bg-secondary shadow-xl dark:shadow-none flex flex-col transition-all duration-500 ease-in-out ${activeFileName ? 'max-w-[1200px]' : 'max-w-[640px]'
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-primary dark:border-white/10 px-8 py-4 bg-bg-tertiary">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="heading-section">Tech Pack Analysis</h2>
                  <p className="text-[12px] font-medium text-text-secondary flex items-center gap-1.5 mt-0.5">
                    {activeFileName ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-white animate-pulse" />
                        Analyzing: <span className="font-semibold text-text-primary">{activeFileName}</span>
                      </>
                    ) : (
                      <span>Pending Upload</span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-neutral-100 dark:hover:bg-bg-elevated hover:text-text-primary transition-premium active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            {activeFileName ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-0 flex-1 overflow-y-auto h-[500px] lg:h-[540px] custom-scrollbar">
                  {/* Left HUD Panel */}
                  <div className="relative p-8 border-r border-border-primary dark:border-white/10 bg-[#F8FAFC] dark:bg-bg-tertiary overflow-hidden flex flex-col justify-center items-center lg:min-h-[500px]">
                    <div className="relative h-full w-full rounded-xl border border-border-primary dark:border-white/10 overflow-hidden bg-bg-secondary shadow-sm flex items-center justify-center">
                      {pdfPreviewUrl ? (
                        <img
                          src={pdfPreviewUrl}
                          alt="Tech Pack Ingestion Page Preview"
                          className="max-h-[95%] max-w-[95%] object-contain opacity-95 dark:opacity-85 transition-opacity duration-300 shadow-sm border border-slate-200/40 dark:border-white/5 rounded"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500 w-full h-full bg-slate-50 dark:bg-slate-900/10 p-6 animate-pulse">
                          <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 shadow-inner">
                            <FileText size={32} className="text-slate-400 dark:text-slate-500" />
                          </div>
                          <div className="text-center space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                              {isAnalyzing ? "Processing Technical File..." : "Loading Page Preview..."}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-600 max-w-[200px] block leading-normal">
                              Generating dynamic canvas preview for scanning
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Scanning HUD Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Glowing Scanline */}
                        {ingestionProgress < 100 && (
                          <motion.div
                            className="absolute inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent dark:via-white/40 shadow-[0_0_15px_rgba(148,163,184,0.3)] dark:shadow-[0_0_15px_rgba(255,255,255,0.25)] z-10"
                            animate={{ top: ['5%', '95%', '5%'] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                          />
                        )}

                        {/* Animated Floating Calibration Corner Elements */}
                        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-text-tertiary/20" />
                        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-text-tertiary/20" />
                        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-text-tertiary/20" />
                        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-text-tertiary/20" />

                        {/* Active Overlay Bounding Boxes with micro animations */}
                        <AnimatePresence>
                          {ingestionProgress > 10 && ingestionProgress < 95 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute top-[10%] left-[20%] w-[60%] h-[35%] border border-blue-500/30 rounded-sm bg-blue-500/[0.02]"
                            >
                              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-500 shadow-sm" />
                              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-500 shadow-sm" />
                              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-500 shadow-sm" />
                              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-500 shadow-sm" />
                              <div className="absolute -top-5 left-1 text-[8px] font-bold text-blue-500 uppercase tracking-widest bg-bg-secondary px-1 py-0.5 rounded shadow-sm border border-border-primary dark:border-white/10">
                                FRONT_LOGO_SPEC
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {ingestionProgress > 25 && ingestionProgress < 95 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute bottom-[20%] left-[8%] w-[38%] h-[32%] border border-emerald-500/30 rounded-sm bg-emerald-500/[0.02]"
                            >
                              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-500" />
                              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-500" />
                              <div className="absolute -top-5 left-1 text-[8px] font-bold text-emerald-500 uppercase tracking-widest bg-bg-secondary px-1 py-0.5 rounded shadow-sm border border-border-primary dark:border-white/10">
                                COLOR_PMS_TABLE
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {ingestionProgress > 45 && ingestionProgress < 95 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute bottom-[28%] right-[10%] w-[36%] h-[28%] border border-amber-500/30 rounded-sm bg-amber-500/[0.02]"
                            >
                              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-500" />
                              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-amber-500" />
                              <div className="absolute -top-5 left-1 text-[8px] font-bold text-amber-500 uppercase tracking-widest bg-bg-secondary px-1 py-0.5 rounded shadow-sm border border-border-primary dark:border-white/10">
                                LEFT_BRAND_ZONE
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className="flex flex-col p-6 bg-bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[14px] font-semibold uppercase tracking-wide text-text-primary">Metadata Extraction</h3>
                      <div className="flex items-center gap-1.5 text-text-primary bg-bg-tertiary px-2.5 py-1 rounded-md border border-border-primary dark:border-white/10 shadow-sm">
                        <Zap size={12} className="text-amber-500 fill-amber-500" strokeWidth={0} />
                        <span className="text-[14px] font-mono font-semibold tracking-wide">{Math.round(ingestionProgress)}%</span>
                      </div>
                    </div>

                    {/* Micro Linear Progress Tracker */}
                    <div className="relative h-[4px] w-full bg-bg-primary dark:bg-bg-tertiary rounded-full overflow-hidden mb-4 border border-border-primary/50 dark:border-white/5">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-text-primary dark:bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${ingestionProgress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>

                    {/* Extraction Fields Structured Layout */}
                    <div className="pr-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                        {/* Column 1: Base Architecture & Colorway Mapping */}
                        <div className="space-y-4 flex flex-col justify-start">
                          {renderBaseArchitecture()}
                          {renderColorwayMapping()}
                        </div>

                        {/* Column 2: Branding Specs */}
                        <div>
                          {renderBrandingSpecs()}
                        </div>
                      </div>
                    </div>

                    {/* Selected Angles Section */}
                    <AnimatePresence>
                      {ingestionProgress >= 100 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.25 }}
                          className="mt-4 pt-4 border-t border-border-primary dark:border-white/10"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Angles to Render</span>
                            <span className="text-[9px] font-medium text-text-tertiary">Select which cap views you want the AI to generate</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {['FRONT ELEVATION', 'THREE-QUARTER RIGHT', 'THREE-QUARTER LEFT', 'LEFT PROFILE', 'RIGHT PROFILE', 'REAR PROFILE', 'UNDER VIEW'].map(angle => {
                              const isSelected = selectedRenderAngles.includes(angle);
                              const visibleLogos = getLogosVisibleInAngle(angle, extractedData.structuredLogos);
                              return (
                                <div key={angle} className="flex flex-col gap-1 items-start min-w-[130px] max-w-[170px] flex-1">
                                  <button
                                    onClick={() => toggleAngleSelection(angle)}
                                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9.5px] font-bold tracking-wider transition-all duration-200 uppercase cursor-pointer active:scale-95 select-none ${isSelected
                                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black shadow-sm'
                                      : 'border-border-primary dark:border-white/10 bg-transparent text-text-tertiary hover:border-slate-400 dark:hover:border-white/30 hover:text-text-secondary'
                                      }`}
                                  >
                                    {isSelected && (
                                      <motion.span
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        className="flex items-center justify-center shrink-0"
                                      >
                                        <Check size={11} strokeWidth={3.5} />
                                      </motion.span>
                                    )}
                                    <span className="truncate">{angle}</span>
                                  </button>
                                  {visibleLogos.length > 0 ? (
                                    <span className="text-[8px] text-text-secondary font-medium tracking-tight px-1 truncate w-full" title={visibleLogos.join(', ')}>
                                      Visible: {visibleLogos.join(', ')}
                                    </span>
                                  ) : (
                                    <span className="text-[8px] text-text-tertiary/40 italic px-1 font-medium">
                                      No logos in view
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-border-primary dark:border-white/10 bg-bg-tertiary px-8 py-4">
                  <button
                    onClick={handleCancel}
                    className="px-5 h-9 rounded-lg border border-border-primary dark:border-white/10 text-[13px] font-semibold text-text-secondary bg-bg-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated hover:text-text-primary transition-premium active:scale-95 uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={ingestionProgress < 100}
                    onClick={handleComplete}
                    className={`px-8 h-9 rounded-lg text-[13px] font-bold uppercase transition-premium active:scale-95 shadow-sm ${ingestionProgress >= 100
                      ? 'bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200'
                      : 'bg-neutral-100 dark:bg-white/5 text-text-tertiary/60 border border-border-primary cursor-not-allowed'
                      }`}
                  >
                    {ingestionProgress < 100 ? 'Processing...' : 'Generate 3D Model'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-bg-primary h-[500px] lg:h-[540px] relative overflow-hidden">

                  {/* Subtle technical background grid overlay */}
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`relative w-full max-w-[560px] h-[380px] flex flex-col items-center justify-center rounded-3xl border transition-all duration-300 cursor-pointer select-none overflow-hidden ${isDragActive
                      ? 'border-slate-800 dark:border-white/40 bg-bg-secondary scale-[1.02] shadow-[0_12px_44px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_44px_rgba(255,255,255,0.02)]'
                      : 'border-slate-200 dark:border-white/5 bg-bg-secondary hover:border-slate-350 dark:hover:border-white/10 hover:shadow-md'
                      }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileInputChange}
                    />

                    {/* Integrated blueprint calibration corners - aligns with active HUD styling! */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-text-tertiary/20" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-text-tertiary/20" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-text-tertiary/20" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-text-tertiary/20" />

                    {/* Glowing vertical laser sweep line on active drag */}
                    <AnimatePresence>
                      {isDragActive && (
                        <motion.div
                          className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            className="w-full h-[3px] bg-gradient-to-r from-transparent via-slate-400 dark:via-white/50 to-transparent shadow-[0_0_15px_rgba(148,163,184,0.4)] dark:shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10"
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 2.0, repeat: Infinity, ease: 'linear' }}
                            style={{ position: 'absolute', left: 0 }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>



                    {/* Advanced multi-layer concentric radar upload icon */}
                    <div className="relative mb-6">
                      {/* Rotating Outer Dashed Technical Border */}
                      <div
                        className="absolute -inset-3 rounded-full border border-dashed border-slate-200 dark:border-white/10 animate-spin pointer-events-none"
                        style={{ animationDuration: '20s' }}
                      />
                      {/* Interactive ring highlight on hover/drag */}
                      <div className={`absolute -inset-1 rounded-full bg-gradient-to-tr from-slate-200/50 to-slate-300/30 dark:from-white/10 dark:to-white/5 blur-sm opacity-0 transition-opacity duration-300 ${isDragActive ? 'opacity-100' : 'group-hover:opacity-60'
                        }`} />
                      {/* Concentric upload circle with hierarchy adjustment */}
                      <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300 ${isDragActive 
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-black scale-110 shadow-lg' 
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500'
                        }`}>
                        <Upload size={22} className={isDragActive ? 'animate-bounce' : ''} />
                      </div>
                    </div>

                    <h3 className="text-[18px] font-bold text-text-primary dark:text-white mb-2 select-none tracking-tight">
                      Upload Tech Pack
                    </h3>
                    <p className="text-[13px] text-text-secondary dark:text-slate-400 text-center max-w-[420px] px-6 leading-relaxed font-medium select-none">
                      Drag and drop your technical specifications layout anywhere inside this viewport, or select a file manually.
                    </p>

                    {/* Tactile primary select CTA button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }}
                      className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black h-10 px-6 text-[12px] font-bold tracking-wider uppercase transition-premium active:scale-[0.97] select-none shadow-md"
                    >
                      <FileText size={13} className="stroke-[2.5]" />
                      Select Tech Pack File
                    </button>

                    <p className="text-[11px] text-text-tertiary dark:text-slate-500 text-center mt-6 select-none font-semibold">
                      Max file size: <span className="font-bold text-text-secondary dark:text-slate-400">50MB</span> • Format: <span className="font-bold text-text-secondary dark:text-slate-400">PDF only</span>
                    </p>
                  </div>
                </div>

                {/* Footer Cancel Button */}
                <div className="flex items-center justify-end gap-3 border-t border-border-primary dark:border-white/10 bg-bg-tertiary px-8 py-4">
                  <button
                    onClick={handleCancel}
                    className="px-5 h-9 rounded-lg border border-border-primary dark:border-white/10 text-[13px] font-semibold text-text-secondary bg-bg-secondary hover:bg-neutral-50 dark:hover:bg-bg-elevated hover:text-text-primary transition-premium active:scale-95 uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}