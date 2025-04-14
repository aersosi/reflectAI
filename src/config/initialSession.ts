import { AppState, Conversation, Settings } from "@/definitions/session";

const settings: Settings = {
    model: "",
    temperature: 1,
    temperatureSteps: 0.1,
    maxTokens: 4096,
    maxTokensSteps: 4,
    apiKey: "",
};

const conversation: Conversation = {
    assistant: "",
    user: ""
};

const systemPrompt: string = "";
const userPrompt: string = "";

export const defaultSession: AppState = {
    settings,
    systemPrompt,
    userPrompt,
    conversation,
};
