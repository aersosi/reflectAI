import { useQuery } from '@tanstack/react-query';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicResponse } from "@/definitions/api";

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true, // todo: Stelle sicher, dass dies in deiner Produktionsumgebung sicher ist
}) : new Anthropic();

const callAnthropicApi = async (userPrompt: string, systemPrompt?: string): Promise<AnthropicResponse> => {
    try {
        const response = await anthropic.messages.create({
            model: "claude-3-haiku-20240307", // Or make this configurable
            max_tokens: 200,
            temperature: 1,
            system: systemPrompt || "",
            messages: [
                {
                    role: "user",
                    content: [{type: "text", text: userPrompt}],
                },
            ],
        });

        // Validate the structure minimally if needed, though SDK types should help
        if (!response || !response.id || !Array.isArray(response.content)) {
            console.error("Invalid response structure from Anthropic SDK:", response);
            throw new Error("Received invalid message structure from Anthropic");
        }
        return response as AnthropicResponse;

    } catch (error) {
        console.error("Error generating Anthropic message:", error);
        // Re-throw the error for useQuery to handle
        throw error;
    }
};

export const useCallAnthropicApi = (userPrompt: string | null, systemPrompt: string | null) => {

    const queryMessage = async (): Promise<AnthropicResponse> => {
        if (!systemPrompt || !userPrompt) throw new Error("System and User prompts must be provided.");
        return callAnthropicApi(systemPrompt, userPrompt);
    }

    const {
        data: response,
        isLoading,
        error,
        isFetching,
        isSuccess,
    } = useQuery<AnthropicResponse, Error>({
        // changes to systemPrompt or userPrompt will trigger refetch/cache invalidation
        queryKey: ['anthropicMessage', systemPrompt, userPrompt],
        queryFn: queryMessage,
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        // enabled: Query only runs when both prompts are non-null and non-empty strings
        enabled: !!systemPrompt && !!userPrompt,
    });

    return {
        response: response,
        loadingMessages: isLoading || isFetching,
        error: error,
        isSuccess: isSuccess,
        isFetching: isFetching,
    };
};