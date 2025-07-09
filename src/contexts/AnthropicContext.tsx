import { useSession } from "@/contexts/SessionContext";
import { createContext, useContext, useState, useCallback, ReactNode, FC, useMemo, useEffect } from 'react';

import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from "@anthropic-ai/sdk/resources";

import { useSessionActions } from "@/hooks/sidebars/useSessionActions";
import { useFetchAnthropicModels } from '@/hooks/useFetchAnthropicModels';

import { AnthropicContextType, AnthropicResponse } from '@/definitions/api';
import { Message } from "@/definitions/session";

const AnthropicContext = createContext<AnthropicContextType | undefined>(undefined);
export type AnthropicProviderProps = { children: ReactNode };

export const AnthropicProvider: FC<AnthropicProviderProps> = ({children}) => {
    const {anthropicModels, isLoadingModels, error: modelsError} = useFetchAnthropicModels();
    const {currentAppState} = useSession()
    const [loadingMessages, setLoadingMessages] = useState(false);
    const {mapToCurrentMessagesHistory} = useSessionActions();
    const [messagesError, setMessagesError] = useState<Error | null>(null);
    const [apiKeyError, setApiKeyError] = useState(false);

    const temperature = currentAppState.settings?.temperature;
    const model = currentAppState.settings?.model;
    const maxTokens = currentAppState.settings?.maxTokens;

    const apiKeyEnv = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const apiKeyInput = currentAppState.settings?.apiKey;
    const apiKey = apiKeyEnv || (apiKeyInput?.trim() || null);

    useEffect(() => {
        // set error when no key
        // useEffect prevents rerender error
        setApiKeyError(!apiKey);
    }, [apiKey]);

    const anthropic = useMemo(() => {
        if (!apiKey) return null;
        return new Anthropic({
            apiKey,
            dangerouslyAllowBrowser: true,
        });
    }, [apiKey]);

    const formatMessagesForAnthropic = useCallback((messages: Message[]): MessageParam[] => {
        return messages.map((msg) => ({
            role: msg.role,
            content: msg.content.map((c) => ({ type: "text", text: c.text }))
        }));
    }, []);

    const callAnthropic = useCallback(async (currentMessagesHistory: Message[], systemPrompt: string | undefined) => {
        if (!anthropic) {
            console.warn("Anthropic client not initialized due to missing API key.");
            return;
        }

        setLoadingMessages(true);
        setMessagesError(null);

        // console.log("maxTokens", maxTokens)
        // console.log("temperature", temperature)
        // console.log("model", model)
        // console.log("currentMessagesHistory", currentMessagesHistory)
        // console.log("systemPrompt", systemPrompt)

        try {
            const formattedMessages = formatMessagesForAnthropic(currentMessagesHistory);
            const response = await anthropic.messages.create({
                model: model || "claude-3-haiku-20240307",
                max_tokens: maxTokens || 200,
                temperature: temperature || 0.5,
                system: systemPrompt || "",
                messages: formattedMessages
            });

            console.log("response", response)
            console.log("response.model", response.model)

            // Antwort validieren (Grundlegende Prüfung)
            if (!response || !response.id || !Array.isArray(response.content)) {
                console.error("Invalid response structure from Anthropic SDK:", response);
                throw new Error("Invalid response structure received from Anthropic SDK");
            }

            return mapToCurrentMessagesHistory(response as AnthropicResponse)
        } catch (error) {
            console.error("Error when generating the Anthropic message:", error);
            setMessagesError(error instanceof Error ? error : new Error('Error when generating the Anthropic message'));
        } finally {
            setLoadingMessages(false);
        }
    }, [anthropic, formatMessagesForAnthropic, currentAppState]);

    // Kontextwert zusammenstellen
    const contextValue: AnthropicContextType = {
        anthropicModels,
        isLoadingModels,
        modelsError: modelsError ?? null,
        apiKeyError,

        loadingMessages,
        messagesError,

        callAnthropic,
    };

    return (
        <AnthropicContext.Provider value={contextValue}>
            {children}
        </AnthropicContext.Provider>
    );
};

export const useAnthropic = (): AnthropicContextType => {
    const context = useContext(AnthropicContext);
    if (context === undefined) {
        throw new Error('useAnthropic muss innerhalb eines AnthropicProvider verwendet werden');
    }
    return context;
};