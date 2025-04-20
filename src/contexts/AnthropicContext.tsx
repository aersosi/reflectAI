import { useSession } from "@/contexts/SessionContext";
import { Message } from "@/definitions/session";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode, FC } from 'react';
import { AnthropicContextType, AnthropicResponse, MessageContentPart } from '@/definitions/api';
import { useCallAnthropicApi } from '@/hooks/useCallAnthropicApi';
import { useFetchAnthropicModels } from '@/hooks/useFetchAnthropicModels';
// import { LOCAL_STORAGE_SESSION } from "@/config/constants";
// import Anthropic, { Message } from "@anthropic-ai/sdk";


const AnthropicContext = createContext<AnthropicContextType | undefined>(undefined);
export type AnthropicProviderProps = { children: ReactNode };

export const AnthropicProvider: FC<AnthropicProviderProps> = ({children}) => {
    const {models, isLoadingModels, error: modelsError} = useFetchAnthropicModels();
    const {currentAppState, updateSession} = useSession();
    const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
    const [userPrompt, setUserPrompt] = useState<string | null>(null);

    const currentAppStateMessages = currentAppState.messagesHistory ?? [];
    const {
        response: latestAnthropicResponse,
        loadingMessages,
        error: messagesError,
    } = useCallAnthropicApi(systemPrompt, userPrompt); // todo: userPrompt needs to be messagesHistory[]

    const formatMessagesForApi = (messages: Message[]): AnthropicResponse[] => {
        return messages.map(
            (msg) => ({
                id: msg.id ?? `generated-${crypto.randomUUID()}`,
                type: "message",
                role: msg.role,
                content: msg.content as MessageContentPart[],
            })
        )
    };

    const callAnthropic = useCallback((userText: string, systemText?: string) => {
        // These trigger the API call via useGenerateAnthropicMessage
        setUserPrompt(userText);
        systemText && setSystemPrompt(systemText);


    }, [currentAppState]);

    const continueCallAnthropic = useCallback((userText: string, systemText?: string) => {

        // todo: here I need to collect all stuff that was before and call anthropic Api
        // all stuff: system prompt if there, user prompt, all previous entries in messagesHistory
        // setUserPrompt(userText);
        // systemText && setSystemPrompt(systemText);
        //
        console.log(currentAppState.messagesHistory?.length)
        console.log(currentAppState.messagesHistory)


        // todo: this block should only be saved if continuing message, not initial
        // const userMessage: AnthropicResponse = {
        //     id: `user_${crypto.randomUUID()}`,
        //     type: "message",
        //     role: "user",
        //     content: [{type: "text", text: userText}]
        // };
        // updateSession("appState.messagesHistory", userMessage);


    }, [currentAppState, updateSession]);

    const saveAnthropicResponse = useCallback((assistantResponse: AnthropicResponse) => {
        if (!assistantResponse?.content?.[0]?.text?.trim()) return;
        updateSession("appState.messagesHistory", assistantResponse);
    }, [currentAppState, updateSession]);


    // Effect to add the assistant's response to the currentAppStateMessages list when it arrives
    useEffect(() => {
        if (latestAnthropicResponse && !currentAppStateMessages.some(msg => msg.id === latestAnthropicResponse.id)) {
            saveAnthropicResponse(latestAnthropicResponse);
            setUserPrompt(null);
        }
    }, [latestAnthropicResponse, currentAppStateMessages, saveAnthropicResponse]);


    // Define the contexts value
    const contextValue: AnthropicContextType = {
        // Models
        anthropicModels: models,
        isLoadingModels: isLoadingModels,
        modelsError: modelsError ? modelsError : null,

        // Messages - Provide the *list* of currentAppStateMessages
        messagesResponse: formatMessagesForApi(currentAppStateMessages),
        loadingMessages: loadingMessages,
        messagesError: messagesError ? messagesError : null,

        // Functions to interact
        callAnthropic: callAnthropic,
        continueCallAnthropic: continueCallAnthropic,
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
        throw new Error('useAnthropic must be used within an AnthropicProvider');
    }
    return context;
};