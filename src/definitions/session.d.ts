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

export type Message = {
    id?: string | undefined;
    role: "user" | "assistant";
    type: string;
    content: {
        type: string;
        text: string;
    }[];
}

export type AppState = {
    settings: Settings | null;
    systemPrompt: string | undefined;
    messagesHistory: Message[] | [];
};

export type Session = {
    id: string;
    name: string | null;
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
    currentMessagesHistory: Message[] | [];
    loadSession: (sessionId: string) => boolean;
    overwriteSession: (path: string, value: any) => void;
    appendToMessagesHistory: (value: any) => void;
    createSession: (sessionName: string, initialState: AppState) => void;
    deleteSession: (sessionId: string) => void;
    deleteMessage: (messageId: string) => void;
    isSessionLoading: boolean;
};