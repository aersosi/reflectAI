import { AnthropicModel, AppState, Conversation, PromptFragment, Settings } from "@/definitions/session";

const anthropicModels: AnthropicModel[] = [
    { model: "Claude 1" },
    { model: "Claude 2" },
    { model: "Claude 3" },
];

const settings: Settings = {
    model: "Claude 3.5",
    temperature: 0.5,
    maxTokens: 4096,
    apiKey: "asdfgh-sdfgh-asdf",
    anthropicModels: anthropicModels
};

const promptFragment: PromptFragment = {
    systemPrompt: "",
    userPrompt: ""
};

const conversation: Conversation = {
    assistant: "",
    user: ""
};

export const defaultAppState: AppState = {
    settings,
    promptFragment,
    conversation,
};
