import { create } from 'zustand';
import { RenderOptions } from '../types';
import { INITIAL_OPTIONS } from '../config/constants';
import { fileToGenericBase64, analyzeTechPack, generateCapRender } from '../services/geminiService';


interface StudioState {
    extractedData: any;
    isAnalyzing: boolean;
    generatedImages: (string | null)[];
    originalSourceFile: File | null;
    options: RenderOptions;
    pastOptions: RenderOptions[];
    futureOptions: RenderOptions[];

    undo: () => void;
    redo: () => void;
    setExtractedData: (data: any) => void;
    setGeneratedImages: (images: (string | null)[]) => void;
    handleGenerateImages: () => Promise<(string | null)[] | undefined>;

    handleImageSelect: (file: File) => Promise<any>;

    setOptions: (val: RenderOptions | ((prev: RenderOptions) => RenderOptions)) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
    extractedData: null,
    selectedImage: null,
    originalSourceFile: null,
    isAnalyzing: false,
    generatedImages: [],
    options: INITIAL_OPTIONS as any,    
    pastOptions: [],
    futureOptions: [],
    undo: () => set((state) => {
        if (state.pastOptions.length === 0) return state;
        const previous = state.pastOptions[state.pastOptions.length - 1];
        const newPast = state.pastOptions.slice(0, state.pastOptions.length - 1);
        return {
            pastOptions: newPast,
            futureOptions: [state.options, ...state.futureOptions],
            options: previous
        };
    }),
    redo: () => set((state) => {
        if (state.futureOptions.length === 0) return state;
        const next = state.futureOptions[0];
        const newFuture = state.futureOptions.slice(1);
        return {
            pastOptions: [...state.pastOptions, state.options],
            futureOptions: newFuture,
            options: next
        };
    }),

    setExtractedData: (data) => set({ extractedData: data }),

    setOptions: (val) => set((state) => {
        const nextOptions = typeof val === 'function' ? val(state.options) : val;
        return { 
            pastOptions: [...state.pastOptions, state.options],
            futureOptions: [],
            options: nextOptions 
        };
    }),

    setGeneratedImages: (images) =>
        set({ generatedImages: images }),

    handleImageSelect: async (file: File) => {             
        if (!file) {
            console.log('No file selected');
            return;
        };

        try {            
            set({ 
                isAnalyzing: true,
                originalSourceFile: file,
                extractedData: null,
                options: INITIAL_OPTIONS as any,
                pastOptions: [],
                futureOptions: []
            });    

            const fileData = await fileToGenericBase64(file);
            console.log('File data after conversion:', fileData);
            const extracted = await analyzeTechPack(
                fileData.data,
                fileData.mimeType
            );
            console.log('Extracted Data from analyzeTechPack:', extracted);
            
            get().setExtractedData(extracted);
            get().setOptions({...get().options, 
                ...extracted});

            set({ isAnalyzing: false });
            console.log('Extracted Data inside store:', extracted);

            return extracted                            

        } catch (error) {
            console.error('Error processing file:', error);
            set({ isAnalyzing: false });
            return null;
        }
    },

    handleGenerateImages: async () => {        
       try {        
        const state = get();

        if (!state.originalSourceFile) return;

        const generatedImages = await generateCapRender(
            state.originalSourceFile,
            state.options     
        );        

        set({generatedImages: generatedImages});        

        return generatedImages;

       } catch (error) {
           console.error('Error generating images:', error);
       }
    }
}));