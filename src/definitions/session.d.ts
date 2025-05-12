import { PromptVariables } from "@/definitions/variables";

export type Settings = {
    model: string;
    temperature?: number | undefined;
    temperatureMax?: number | undefined;
    temperatureSteps: number;
    maxTokens?: number | undefined;
    maxTokensMax?: number | undefined;
    maxTokensSteps: number;
    apiKey: string;
}

export type SystemMessage = {
    id: string,
    text: string,
}

export type UserMessage = {
    id?: string;
    role: "user";
    content: {
        type: "text";
        text: string;
    }[];
}

export type Message = {
    id?: string | undefined;
    role: "user" | "assistant";
    content: {
        type: "text";
        text: string;
    }[];
}

export type AppState = {
    settings: Settings | null;
    systemPrompt: SystemMessage;
    userPrompt: UserMessage;
    messagesHistory: Message[] | [];
    systemVariables: PromptVariables;
    userVariables: PromptVariables;
};

export type Session = {
    id: string;
    title: string | null;
    date: number; // Unix Timestamp (ms)
    appState: AppState;
};

export type SessionMeta = Omit<Session, 'appState'>;

export type SessionContextType = {
    sessions: SessionMeta[];

    currentSessionId: string | null;
    currentSessionName: string;
    initialAppState: AppState;
    currentAppState: AppState;

    loadSession: (sessionId: string) => boolean;
    createSession: (sessionName: string, initialState: AppState) => void;
    overwriteSession: (path: string, value: any) => void;
    deleteSession: (sessionId: string) => void;

    currentMessagesHistory: Message[] | [];
    appendToMessagesHistory: (value: any) => void;
    deleteMessage: (id: string) => void;

    appendSessionVariable: (path: string, value: any, id: string) => void;
    deleteSessionVariable: (id: string, isUser?: boolean) => void;
    overwriteSessionVariableText: (id: string, value: any, isUser?: boolean) => void;

    isSessionLoading: boolean;
};