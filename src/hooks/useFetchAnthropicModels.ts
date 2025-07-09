import { useSession } from "@/contexts/SessionContext";
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicModelListResponse, AnthropicModel } from '@/definitions/api';
import { loadDataFromStorage, saveDataToStorage } from '@/lib/utils';
import { LOCAL_STORAGE_MODELS } from "@/config/constants";

const fetchAnthropicModels = async (apiKey: string | null): Promise<AnthropicModelListResponse> => {
    if (!apiKey) {
        throw new Error("No API key provided");
    }

    const anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
    });

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
        throw error;
    }
};

export const useFetchAnthropicModels = () => {
    const { currentAppState } = useSession();
    const queryClient = useQueryClient();
    const [anthropicModels, setAnthropicModels] = useState<AnthropicModel[] | null>(null);
    const [initialStorageChecked, setInitialStorageChecked] = useState(false);

    const apiKeyEnv = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const apiKeyInput = currentAppState.settings?.apiKey;
    const apiKey = apiKeyEnv || (apiKeyInput?.trim() || null);

    // Lade gespeicherte Modelle aus dem Local Storage
    useEffect(() => {
        const stored = loadDataFromStorage<AnthropicModel>(LOCAL_STORAGE_MODELS);
        if (stored && Array.isArray(stored) && stored.length > 0) {
            setAnthropicModels(stored);
        }
        setInitialStorageChecked(true);
    }, []);

    // Query für das Abrufen der Modelle
    const {
        data: modelsResponse,
        isLoading: isLoadingFromAPI,
        error: queryError,
        isSuccess,
    } = useQuery<AnthropicModelListResponse, Error>({
        queryKey: ['anthropicModels', apiKey], // apiKey als Teil des queryKey
        queryFn: () => fetchAnthropicModels(apiKey),
        staleTime: 10 * 60 * 1000, // 10 Minuten
        refetchOnWindowFocus: false,
        enabled: initialStorageChecked && !!apiKey, // Nur ausführen, wenn apiKey vorhanden
    });

    // Modelle aktualisieren und im Local Storage speichern
    useEffect(() => {
        if (isSuccess && modelsResponse?.data) {
            setAnthropicModels(modelsResponse.data);
            saveDataToStorage(modelsResponse.data, LOCAL_STORAGE_MODELS);
        }
    }, [modelsResponse, isSuccess]);

    // Invalidiere die Abfrage, wenn der apiKey sich ändert
    useEffect(() => {
        if (initialStorageChecked && apiKey) {
            queryClient.invalidateQueries({ queryKey: ['anthropicModels', apiKey] });
        }
    }, [apiKey, initialStorageChecked, queryClient]);

    const isLoadingModels = !initialStorageChecked || (initialStorageChecked && !anthropicModels && isLoadingFromAPI);

    return {
        anthropicModels,
        isLoadingModels,
        error: queryError,
    };
};