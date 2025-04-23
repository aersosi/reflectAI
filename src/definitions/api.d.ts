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

export type AnthropicResponse = {
    id: string;
    type: string;
    role: "assistant" | "user";
    model?: string;
    content: MessageContentPart[];
    stop_reason?: string;
    stop_sequence?: string | null;
    usage?: MessageUsage;
};


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

    loadingMessages: boolean;
    messagesError: Error | null;
    callAnthropic: (currentMessagesHistory: Message[], systemPrompt: string | undefined) => Promise<void>
}