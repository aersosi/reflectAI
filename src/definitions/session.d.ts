export type Settings = {
    model: string;
    temperature: number;
    temperatureSteps: number;
    maxTokens: number;
    maxTokensSteps: number;
    apiKey: string;
}

export type Conversation = {
    assistant: string;
    user: string;
}

export type AppState = {
    settings: Settings | null;
    systemPrompt: string;
    userPrompt: string;
    conversation: Conversation | null;
};

export type Session = {
    id: string;
    name: string;
    date: number; // Unix Timestamp (ms)
    appState: AppState | null;
};

export type SessionMeta = Omit<Session, 'appState'>; // Nur Metadaten für die Liste

export type SessionContextType = {
    sessions: SessionMeta[];
    currentSessionId: string | null;
    currentSessionName: string | null;
    initialSession: AppState;
    currentSession: AppState | null;
    loadSession: (sessionId: string) => boolean;
    saveSession: (
        updates?: string | { settings: Partial<Settings> },
        updatedState?: AppState | null
    ) => void;
    createSession: (sessionName: string, initialState: AppState) => void;
    deleteSession: (sessionId: string) => void;
    isSessionLoading: boolean;
};