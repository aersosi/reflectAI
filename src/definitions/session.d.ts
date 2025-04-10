export type AppState = {
    // Definiere hier die Struktur deines App-Zustands
    someValue: string;
    anotherValue: number;
    complexData: any[];
    // Füge hier alle Teile deines States hinzu, die gespeichert werden sollen
};

export type Session = {
    id: string;
    name: string;
    date: number; // Unix Timestamp (ms)
    appState: AppState | null;
};

export type SessionMeta = Omit<Session, 'appState'>; // Nur Metadaten für die Liste

export type SessionContextType = {
    sessions: SessionMeta[]; // Liste der Metadaten aller Sessions
    currentSessionId: string | null;
    currentSessionName: string | null;
    currentAppState: AppState | null;
    loadSession: (sessionId: string) => boolean; // Gibt true zurück bei Erfolg
    createSession: (sessionName: string, initialState: AppState) => void;
    saveCurrentSession: (sessionName: string, updatedState: AppState | null) => void;
    deleteSession: (sessionId: string) => void;
    isSessionLoading: boolean; // Nützlich, um Ladezustände anzuzeigen
    defaultInitialState: AppState;
};