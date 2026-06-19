export interface ThreadLayer {
  index: number;
  description: string;
  pms: string;
}

export interface StructuredLogo {
  position: string;
  designNumber: string;
  description: string;
  isRaised: boolean;
  visualMapping: {
    fill: string;
    border: string;
  };
  colorLayers: ThreadLayer[];
}

export interface ExtractedMetadata {
  teamName: string;
  silhouetteFamily: string;
  silhouetteStyle: string;
  fabricTech: string;
  crownColor: string;
  visorColor: string;
  undervisorColor: string;
  buttonColor: string;
  visorStitchingColor: string;
  eyeletColor: string;
  sweatbandColor: string;
  newEraFlagColor: string;
  structuredLogos: StructuredLogo[];
}
