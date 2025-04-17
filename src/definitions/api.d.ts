type MessageContentPart = {
    type: "text";
    text: string;
};

type MessageUsage = {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
};

export type AssistantMessage = {
    id: string;
    type: "message";
    role: "assistant" | "user";
    model?: string;
    content: MessageContentPart[];
    stop_reason?: string;
    stop_sequence?: string | null;
    usage?: MessageUsage;
};

export type DataItem = {
    title: string;
    variables: string[];
};

export type DataArray = DataItem[];

export type AnthropicModel = {
    display_name: string,
    id: string,
    created_at: string,
    type: string
}

export type AnthropicModelListResponse = {
    data: AnthropicModel[] | null;
    first_id?: string | null;
    has_more: boolean;
    last_id?: string | null;
}

export type AnthropicContextType = {
    anthropicModels: AnthropicModel[] | null;
    isLoadingModels: boolean;
    modelsError: Error | null;

    messagesReturn: AssistantMessage[] | null;
    loadingMessages: boolean;
    messagesError: Error | null;
    generateUserPrompt: (prompt: string) => void;
    generateSystemPrompt: (prompt: string) => void;
}