import { AppState, Message, Settings, SystemPrompt } from "@/definitions/session";
import { VariablesHistory } from "@/definitions/variables";

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
const systemPrompt: SystemPrompt = {
    id: "system_prompt",
    text: "",
};

export const variablesHistory: VariablesHistory = {
    systemVariables: {
        id: "system_variables",
        title: "System prompt",
        variables: []
    },
    userVariables: {
        id: "user_variables",
        title: "User prompt",
        variables: []
    },
}

export const defaultAppState: AppState = {
    settings,
    systemPrompt,
    messagesHistory,
    variablesHistory,
};
