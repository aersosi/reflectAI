import { AppState, Messages, Settings } from "@/definitions/session";

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

const messages: Messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": ""
            }
        ]
    },
    {
        "role": "assistant",
        "content": [
            {
                "type": "text",
                "text": ""
            }
        ]
    }
];


const systemPrompt: string = "";
const userPrompt: string = "";

export const defaultAppState: AppState = {
    settings,
    systemPrompt,
    userPrompt,
    messages,
};
