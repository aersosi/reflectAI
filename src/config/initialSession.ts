import { AppState, Message, Settings } from "@/definitions/session";

const settings: Settings = {
    model: "",
    temperature: 1,
    temperatureMax: 1,
    temperatureSteps: 0.1,
    maxTokens: 4096,
    maxTokensMax: 4096,
    maxTokensSteps: 4,
    apiKey: "",
};

const messagesHistory: Message[] = [];
const systemPrompt: string = "";

export const defaultAppState: AppState = {
    settings,
    systemPrompt,
    messagesHistory,
};
