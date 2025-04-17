import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnthropicContextType, AssistantMessage } from '@/definitions/api';
import { useGenerateAnthropicMessage } from '@/hooks/useGenerateAnthropicMessage';
import { useFetchAnthropicModels } from '@/hooks/useFetchAnthropicModels';
import { LOCAL_STORAGE_SESSION } from "@/config/constants";

const AnthropicContext = createContext<AnthropicContextType | undefined>(undefined);
export type AnthropicProviderProps = { children: React.ReactNode };

export const AnthropicProvider: React.FC<AnthropicProviderProps> = ({children}) => {
    const {models, isLoadingModels, error: modelsError} = useFetchAnthropicModels();
    const [currentSystemPrompt, setCurrentSystemPrompt] = useState<string>("You are a helpful assistant."); // Default or set initially
    const [promptToApi, setPromptToApi] = useState<string | null>(null);
    const [messages, setMessages] = useState<AssistantMessage[]>([]);

    // Hook to generate the *next* assistant message
    const {
        message: latestAssistantMessage,
        loadingMessages,
        error: messagesError,
    } = useGenerateAnthropicMessage(currentSystemPrompt, promptToApi);

    // Function to set the system prompt (if needed outside initial)
    const handleGenerateSystemPrompt = useCallback((prompt: string) => {
        if (prompt && prompt.trim() !== '') {
            setCurrentSystemPrompt(prompt);
            // Optional: Clear chat or add system message indicator?
            // setMessages([]); // Example: Clear chat when system prompt changes
        }
    }, []);


    // const handleSaveReturn = useCallback( () => {
    //     const {currentAppState, saveSession} = useSession();
    //
    //     const updatedAppState: AppState = {
    //         ...currentAppState,
    //         messages: [
    //             ...(currentAppState?.messages ?? []),
    //             {
    //                 role: "assistant",
    //                 content: [{ type: "text", text: "Neue Nachricht vom Assistant." }]
    //             }
    //         ]
    //     };
    //
    //     saveSession(undefined, updatedAppState);
    //
    //     console.log(currentAppState);
    //
    //
    //     // saveDataToStorage<Session>([newSession], LOCAL_STORAGE_SESSION);
    // }, [])

    // Function called by UI to send a new user message
    const handleGenerateUserPrompt = useCallback((prompt: string) => {
        if (!prompt || prompt.trim() === '') return;
        const userMessage: AssistantMessage = {
            id: `user-${crypto.randomUUID()}`, // Generate unique ID for the user message
            type: "message",
            role: "user",
            content: [{type: "text", text: prompt}]
        };

        // handleSaveReturn();


        setMessages(prevMessages => [...prevMessages, userMessage]);
        setPromptToApi(prompt);

    }, []);

    // Effect to add the assistant's response to the messages list when it arrives
    useEffect(() => {
        // Check if there's a new assistant message and it's not already in the list
        if (latestAssistantMessage && !messages.some(msg => msg.id === latestAssistantMessage.id)) {
            setMessages(prevMessages => [...prevMessages, latestAssistantMessage]);
            setPromptToApi(null);
        }
    }, [latestAssistantMessage, messages]);

    // Define the contexts value
    const contextValue: AnthropicContextType = {
        // Models
        anthropicModels: models,
        isLoadingModels: isLoadingModels,
        modelsError: modelsError ? modelsError : null,

        // Messages - Provide the *list* of messages
        messagesReturn: messages,
        loadingMessages: loadingMessages,
        messagesError: messagesError ? messagesError : null,

        // Functions to interact
        generateSystemPrompt: handleGenerateSystemPrompt,
        generateUserPrompt: handleGenerateUserPrompt,
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