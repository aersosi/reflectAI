export type AnthropicModel = {
    model: string;
}

export type Settings = {
    model: string;
    temperature: number;
    maxTokens: number;
    apiKey: string;
    anthropicModels: AnthropicModel[];
}

export type PromptFragment = {
    systemPrompt: string;
    userPrompt: string;
}

export type Conversation = {
    assistant: string;
    user: string;
}

export type AppState = {
    settings: Settings | null;
    promptFragment: PromptFragment | null;
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
    currentAppState: AppState | null;
    loadSession: (sessionId: string) => boolean;
    createSession: (sessionName: string, initialState: AppState) => void;
    saveCurrentSession: (sessionName: string, updatedState: AppState | null) => void;
    deleteSession: (sessionId: string) => void;
    isSessionLoading: boolean;
    defaultInitialState: AppState;
};