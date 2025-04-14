import { useQuery } from '@tanstack/react-query';
import Anthropic from '@anthropic-ai/sdk';
import { AssistantMessage } from "@/definitions/api";

const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true, // Stelle sicher, dass dies in deiner Produktionsumgebung sicher ist
});

const generateAnthropicMessage = async (systemPrompt: string, userPrompt: string): Promise<AssistantMessage> => {
    try {
        // console.log(`Initiating Anthropic call with System Prompt: ${systemPrompt}`);
        // console.log(`User Prompt: ${userPrompt}`);

        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307", // Or make this configurable
            max_tokens: 200,
            temperature: 0.8,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: [{type: "text", text: userPrompt}],
                },
            ],
        });

        // Validate the structure minimally if needed, though SDK types should help
        if (!message || !message.id || !Array.isArray(message.content)) {
            console.error("Invalid response structure from Anthropic SDK:", message);
            throw new Error("Received invalid message structure from Anthropic");
        }
        return message as AssistantMessage;

    } catch (error) {
        console.error("Error generating Anthropic message:", error);
        // Re-throw the error for useQuery to handle
        throw error;
    }
};

export const useGenerateAnthropicMessage = (systemPrompt: string | null, userPrompt: string | null) => {

    const queryMessage = async (): Promise<AssistantMessage> => {
        if (!systemPrompt || !userPrompt) throw new Error("System and User prompts must be provided.");
        return generateAnthropicMessage(systemPrompt, userPrompt);
    }

    const {
        data: message,
        isLoading,
        error,
        isFetching,
        isSuccess,
    } = useQuery<AssistantMessage, Error>({ // <-- Correct Type: AssistantMessage
        // changes to systemPrompt or userPrompt will trigger refetch/cache invalidation
        queryKey: ['anthropicMessage', systemPrompt, userPrompt],
        queryFn: queryMessage,
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        // enabled: Query only runs when both prompts are non-null and non-empty strings
        enabled: !!systemPrompt && !!userPrompt,
    });

    return {
        message: message,
        isLoadingMessage: isLoading || isFetching,
        error: error,
        isSuccess: isSuccess,
        isFetching: isFetching,
    };
};