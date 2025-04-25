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
        variables: [
            {
                id: "systemVar_1",
                name: "{{ text 1 }}",
                text: "Lorem ipsum dolor sit"
            },
            {
                id: "systemVar_2",
                name: "{{ text 2 }}",
                text: "Lorem ipsum dolor sit"
            },
        ]
    },
    userVariables: {
        parentId: "user_123456",
        title: "User prompt",
        variables: [
            {
                id: "userVar_1",
                name: "{{ text 1 }}",
                text: "Lorem ipsum dolor sit"
            },
            {
                id: "userVar_2",
                name: "{{ text 2 }}",
                text: "Lorem ipsum dolor sit"
            },
        ]
    },
}

    [
    {
        "id": "userVars",
        "title": "User prompt",
        "variables": [
            {
                "id": "userVar_90791434-db40-4734-989f-af776b2dd396",
                "variable": "{{ User 1 }}"
            },
            {
                "id": "userVar_e4664eae-aacb-4f10-92dd-dd241b7fd0e5",
                "variable": "{{ User 2 }}"
            }
        ]
    }
    ]

export const defaultAppState: AppState = {
    settings,
    systemPrompt,
    messagesHistory,
    variablesHistory2,
};
