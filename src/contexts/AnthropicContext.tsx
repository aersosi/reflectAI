import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
    FC,
    useMemo
} from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from "@anthropic-ai/sdk/resources"; // Beibehalten für die Formatierung
import { useSession } from "@/contexts/SessionContext";
import { Message } from "@/definitions/session";
import { AnthropicContextType, AnthropicResponse } from '@/definitions/api';
import { useFetchAnthropicModels } from '@/hooks/useFetchAnthropicModels'; // Dieser Hook bleibt bestehen

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
const AnthropicContext = createContext<AnthropicContextType | undefined>(undefined);
export type AnthropicProviderProps = { children: ReactNode };

export const AnthropicProvider: FC<AnthropicProviderProps> = ({children}) => {
    const anthropic = useMemo(() => apiKey
        ? new Anthropic({
            apiKey,
            dangerouslyAllowBrowser: true,
        }) : new Anthropic(), []
    );

    const {models, isLoadingModels, error: modelsError} = useFetchAnthropicModels();
    const {currentAppState, updateSession} = useSession();
    const messagesHistory = currentAppState.messagesHistory ?? [];

    const [loadingMessages, setLoadingMessages] = useState(false);
    const [messagesError, setMessagesError] = useState<Error | null>(null);

    const formatMessagesForAnthropic = useCallback((
        messages: Message[] // Nimmt jetzt direkt Message[] entgegen
    ): MessageParam[] => {
        return messages.map((msg) => ({
            role: msg.role,
            content: msg.content.map((c) => ({type: "text", text: c.text}))
        }));
    }, []);

    const saveAnthropicResponse = useCallback((latestAnthropicResponse: AnthropicResponse) => {
        if (!latestAnthropicResponse?.content?.[0]?.text?.trim()) {
            console.warn("Leere Anthropic-Antwort erhalten, wird nicht gespeichert.");
            return;
        }

        const mapAnthropicToMessagesHistory = (source: AnthropicResponse) => {
            return {
                id: `assistant_${crypto.randomUUID()}`,
                type: "message",
                role: "assistant",
                content: source.content.map((block) => ({
                    type: "text",
                    text: block.text
                }))
            };
        };

        updateSession("appState.messagesHistory", mapAnthropicToMessagesHistory(latestAnthropicResponse));
        console.log("Anthropic-Antwort gespeichert:", latestAnthropicResponse);

    }, [updateSession]);

    const callAnthropic = useCallback(async (messagesHistory: Message[], systemPrompt: string) => {
        setLoadingMessages(true);
        setMessagesError(null);

        try {
            const formattedMessages = formatMessagesForAnthropic(messagesHistory);

            const response = await anthropic.messages.create({
                model: "claude-3-haiku-20240307", // TODO: Modell eventuell konfigurierbar machen
                max_tokens: 200,
                temperature: 1,
                system: systemPrompt,
                messages: formattedMessages
            });

            // Antwort validieren (Grundlegende Prüfung)
            if (!response || !response.id || !Array.isArray(response.content)) {
                console.error("Ungültige Antwortstruktur vom Anthropic SDK:", response);
                throw new Error("Ungültige Antwortstruktur von Anthropic erhalten");
            }

            saveAnthropicResponse(response as AnthropicResponse);

        } catch (error) {
            console.error("Fehler beim Generieren der Anthropic-Nachricht:", error);
            setMessagesError(error instanceof Error ? error : new Error('Ein unbekannter Fehler ist aufgetreten'));
        } finally {
            setLoadingMessages(false);
        }
    }, [anthropic, formatMessagesForAnthropic, saveAnthropicResponse]);

    // --- Kontextwert zusammenstellen ---
    const contextValue: AnthropicContextType = {
        anthropicModels: models,
        isLoadingModels: isLoadingModels,
        modelsError: modelsError ? modelsError : null,

        messagesHistory: messagesHistory,
        loadingMessages: loadingMessages,
        messagesError: messagesError,

        callAnthropic: callAnthropic,
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