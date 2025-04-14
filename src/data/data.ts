import { AppState, Conversation, Settings } from "@/definitions/session";

const settings: Settings = {
    model: "Claude 3.5",
    temperature: 0.5,
    maxTokens: 4096,
    apiKey: "asdfgh-sdfgh-asdf",
};


const conversation: Conversation = {
    assistant: "",
    user: ""
};

const systemPrompt: string = "";
const userPrompt: string = "";

export const defaultAppState: AppState = {
    settings,
    systemPrompt,
    userPrompt,
    conversation,
};
