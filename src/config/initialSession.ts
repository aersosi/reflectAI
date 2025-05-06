import { AppState, Message, Settings, SystemMessage, UserMessage } from "@/definitions/session";
import { PromptVariables} from "@/definitions/variables";

const settings: Settings = {
    model: "claude-2.0",
    temperature: 0.5,
    temperatureMax: 1,
    temperatureSteps: 0.1,
    maxTokens: 2048,
    maxTokensMax: 4096,
    maxTokensSteps: 4,
    apiKey: "",
};

const messagesHistory: Message[] = [];
const systemPrompt: SystemMessage = {
    id: "system_prompt",
    text: "",
};

const userPrompt: UserMessage = {
    id: "user_prompt",
    role: "user",
    content: [{type: "text", text: ""}]

};

const systemVariables: PromptVariables = {
    id: "system_variables",
    title: "System Variables",
    variables: []
}

const userVariables: PromptVariables = {
    id: "user_variables",
    title: "User Variables",
    variables: []
}

export const defaultAppState: AppState = {
    settings,
    systemPrompt,
    userPrompt,
    messagesHistory,
    systemVariables,
    userVariables
};
