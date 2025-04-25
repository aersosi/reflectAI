import { AppState, Message, Settings, SystemPrompt } from "@/definitions/session";
import { VariablesHistory2 } from "@/definitions/variables";

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

export const variablesHistory2: VariablesHistory2 = {
    systemVariables: {
        parentId: "system_prompt",
        title: "System prompt",
        variables: {
            id: "systemVar_123456",
            name: "{{ text1 }}",
            text: "Lorem ipsum dolor sit"
        }
    },
    userVariables: {
        parentId: "user_123456",
        title: "User prompt",
        variables: {
            id: "userVar_123456",
            name: "{{ text2 }}",
            text: "Lorem ipsum dolor sit"
        }
    },
}

export const defaultAppState: AppState = {
    settings,
    systemPrompt,
    messagesHistory,
    variablesHistory2,
};
