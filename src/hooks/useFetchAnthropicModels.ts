import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicModelListResponse, AnthropicModel } from '@/definitions/api';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/utils';
import { LOCAL_STORAGE_MODELS } from "@/config/constants";

const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true, // Stelle sicher, dass dies in deiner Produktionsumgebung sicher ist
});

const fetchAnthropicModels = async (): Promise<AnthropicModelListResponse> => {
    try {
        const response = await anthropic.models.list({
            limit: 20,
        });
        if (!response || !Array.isArray(response.data)) {
            console.error("Invalid API response structure:", response);
            throw new Error("Invalid API response structure from Anthropic");
        }
        return {
            data: response.data as AnthropicModel[],
            has_more: response.has_more ?? false,
            first_id: response.first_id,
            last_id: response.last_id,
        };
    } catch (error) {
        console.error("Error fetching Anthropic models:", error);
        // Wirf den Fehler weiter, damit useQuery ihn behandeln kann
        throw error;
    }
};

export const useFetchAnthropicModels = () => {
    const [anthropicModels, setAnthropicModels] = useState<AnthropicModel[] | null>(null);
    const [initialStorageChecked, setInitialStorageChecked] = useState(false);

    useEffect(() => {
        const stored = loadDataFromStorage<AnthropicModel>(LOCAL_STORAGE_MODELS);
        if (stored && Array.isArray(stored) && stored.length > 0) setAnthropicModels(stored);
        setInitialStorageChecked(true);
    }, []);

    const {
        data: modelsResponse,
        isLoading: isLoadingFromAPI,
        error: queryError,
        isSuccess,
    } = useQuery<AnthropicModelListResponse, Error>({
        queryKey: ['anthropicModels'],
        queryFn: fetchAnthropicModels,
        staleTime: 10 * 60 * 1000, // 10 Minuten
        refetchOnWindowFocus: false,
        // Aktiviere den Query nur, wenn der Storage-Check abgeschlossen ist UND keine Modelle gefunden wurden.
        enabled: initialStorageChecked && anthropicModels === null,
    });

    // Modelle aus API-Antwort übernehmen und im Local Storage speichern
    useEffect(() => {
        if (isSuccess && modelsResponse?.data) {
            console.log("API fetch successful, updating state and storage:", modelsResponse.data);
            setAnthropicModels(modelsResponse.data);
            saveDataToStorage(modelsResponse.data, LOCAL_STORAGE_MODELS);
        }
    }, [modelsResponse, isSuccess]); // Nur auf Änderungen der Query-Ergebnisse reagieren

    // Kombinierter Ladezustand: True, wenn Storage noch nicht geprüft ODER wenn geprüft,
    // keine Modelle vorhanden sind UND die API noch lädt.
    const isLoadingModels = !initialStorageChecked || (initialStorageChecked && anthropicModels === null && isLoadingFromAPI);

    return {
        anthropicModels,
        isLoadingModels,
        error: queryError, // Error of API-Call
    };
};