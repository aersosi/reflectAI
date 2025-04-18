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
    content: {
        type: string;
        text: string;
    }[];
}

export type Messages = Message[];

export type AppState = {
    settings: Settings | null;
    systemPrompt: string | undefined;
    userPrompt: string;
    messagesHistory: Messages | null;
};

export type Session = {
    id: string;
    name: string | null;
    date: number; // Unix Timestamp (ms)
    appState: AppState | null;
};

export type SessionMeta = Omit<Session, 'appState'>;

export type SessionContextType = {
    sessions: SessionMeta[];
    currentSessionId: string | null;
    currentSessionName: string | null;
    initialAppState: AppState;
    currentAppState: AppState | null;
    loadSession: (sessionId: string) => boolean;
    saveSession: (
        updates?: string | { settings: Partial<Settings> },
        updatedState?: AppState | null
    ) => void;
    createSession: (sessionName: string, initialState: AppState) => void;
    deleteSession: (sessionId: string) => void;
    isSessionLoading: boolean;
};