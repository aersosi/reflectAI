import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Anthropic from "@anthropic-ai/sdk";
import {
    AnthropicModelListResponse,
    AnthropicContextType,
    AnthropicModel
} from "@/definitions/api";
import { loadDataFromStorage, saveDataToStorage } from "@/lib/utils.ts";

const LOCAL_STORAGE_KEY = 'anthropicModels';

const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
});

const fetchAnthropicModels = async (): Promise<AnthropicModelListResponse> => {
    const response = await anthropic.models.list({
        limit: 20,
    });
    const modelsArray = response.data as AnthropicModel[]; // Sicherstellen, dass response.data das Array ist
    return {
        data: modelsArray,
        has_more: response.has_more ?? false, // Beispielhafte Handhabung optionaler Felder
        first_id: response.first_id,
        last_id: response.last_id
    } as AnthropicModelListResponse;
};

const AnthropicContext = createContext<AnthropicContextType | undefined>(undefined);

export type AnthropicProviderProps = React.FC<{ children: React.ReactNode }>

export const AnthropicProvider: AnthropicProviderProps  = ({children}) => {
    const [anthropicModels, setAnthropicModels] = useState<AnthropicModel[] | null>(null);
    const [initialStorageChecked, setInitialStorageChecked] = useState(false);

    useEffect(() => {
        const stored = loadDataFromStorage<AnthropicModel>(LOCAL_STORAGE_KEY); // Lade als Array
        if (stored && Array.isArray(stored) && stored.length > 0) setAnthropicModels(stored);
        setInitialStorageChecked(true);
    }, []);

    const {
        data: modelsResponse,
        isLoading: isLoadingFromAPI,
        error: modelsError,
        isSuccess,
    } = useQuery<AnthropicModelListResponse, Error>({ // Use the defined interface
        queryKey: ['anthropicModels'], // Unique key for this query
        queryFn: fetchAnthropicModels, // The async function to fetch data
        // Optional: configure staleTime, cacheTime, retry, etc.
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        enabled: initialStorageChecked && !anthropicModels, // Nur bei bedarf fetchen
    });

    useEffect(() => {
        // Wenn der API-Fetch erfolgreich war
        if (isSuccess && modelsResponse?.data) {
            console.log("modelsResponse", modelsResponse);
            console.log("modelsResponse.data", modelsResponse.data);
            setAnthropicModels(modelsResponse.data); // Aktualisiere den State mit den API-Daten
            saveDataToStorage(modelsResponse.data, LOCAL_STORAGE_KEY); // Speichere die neuen Daten
        }
    }, [modelsResponse, isSuccess]);

    const isLoadingModels = !initialStorageChecked || (initialStorageChecked && !anthropicModels && isLoadingFromAPI);

    const contextValue: AnthropicContextType = {
        anthropicModels: anthropicModels,
        isLoadingModels: isLoadingModels,
        modelsError
    };

    return (
        <AnthropicContext.Provider value={contextValue}>
            {children}
        </AnthropicContext.Provider>
    );
}

export const useAnthropic = (): AnthropicContextType => {
    const context = useContext(AnthropicContext);
    if (context === undefined) {
        throw new Error('useModel must be used within a ModelProvider');
    }
    return context;
};
