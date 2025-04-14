import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SessionContextType, Session, SessionMeta, AppState, Settings } from "@/definitions/session";
import { loadDataFromStorage, saveDataToStorage } from "@/lib/utils";

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'reactAppSessions';

type SessionProviderProps = React.FC<{ children: React.ReactNode, initialSession: AppState }>

export const SessionProvider: SessionProviderProps = ({children, initialSession}) => {
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentSessionName, setCurrentSessionName] = useState<string | null>(null);
    const [currentSession, setCurrentSession] = useState<AppState | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true); // Startet als true

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        setIsSessionLoading(true);
        const storedSessions = loadDataFromStorage<Session>(LOCAL_STORAGE_KEY);
        setAllSessions(storedSessions);

        const sessionIdFromUrl = searchParams.get('sessionId');
        let sessionToLoad: Session | null = null;

        if (sessionIdFromUrl) {
            sessionToLoad = storedSessions.find(s => s.id === sessionIdFromUrl) || null;
            if (!sessionToLoad) {
                console.warn(`Session ID "${sessionIdFromUrl}" not found - redirecting`);
                navigate('/', { replace: true });
                setIsSessionLoading(false);
                return;
            }
        }

        if (!sessionToLoad && storedSessions.length > 0) {
            sessionToLoad = [...storedSessions].sort((a, b) => b.date - a.date)[0];
            navigate(`/?sessionId=${sessionToLoad.id}`, { replace: true });
        }

        if (sessionToLoad) {
            Promise.resolve().then(() => {
                setCurrentSessionId(sessionToLoad!.id);
                setCurrentSessionName(sessionToLoad!.name);
                setCurrentSession(sessionToLoad!.appState);
                setIsSessionLoading(false);
            });
        } else {
            setCurrentSessionId(null);
            setCurrentSession(initialSession);
            setIsSessionLoading(false);
        }
    }, [searchParams, navigate, initialSession]);

    const loadSession = useCallback((sessionId: string): boolean => {
        const session = allSessions.find(s => s.id === sessionId);

        console.log("session", session);
        if (session) {
            setIsSessionLoading(true);
            // Use functional update to ensure latest state
            setCurrentSessionId(prev => {
                if (prev !== session.id) {
                    navigate(`/?sessionId=${session.id}`, { replace: true });
                }
                return session.id;
            });
            setCurrentSessionName(session.name);
            setCurrentSession(session.appState);
            setIsSessionLoading(false);
            return true;
        }
        console.warn(`Session ${sessionId} not found`);
        return false;
    }, [allSessions, navigate]);

    const createSession = useCallback((sessionName: string, initialState: AppState) => {
        setIsSessionLoading(true);
        const newSession: Session = {
            id: crypto.randomUUID(),
            name: sessionName || `Session ${new Date().toLocaleString()}`,
            date: Date.now(),
            appState: initialState,
        };

        const updatedSessions = [...allSessions, newSession];
        setAllSessions(updatedSessions);
        saveDataToStorage<Session>(updatedSessions, LOCAL_STORAGE_KEY);

        // Direkt zur neuen Session wechseln und URL aktualisieren
        setCurrentSessionId(newSession.id);
        setCurrentSessionName(newSession.name);
        setCurrentSession(newSession.appState);
        navigate(`/?sessionId=${newSession.id}`, {replace: true});
        setIsSessionLoading(false);
    }, [allSessions, navigate]);

    // Funktion zum Speichern des aktuellen Zustands der aktiven Session
    const saveSession = useCallback((
        updates?: string | { settings: Partial<Settings> },
        updatedState?: AppState | null
    ) => {
        setCurrentSession(prev => {
            if (!currentSessionId || !prev) return prev;

            const mergeSettings = (existing: Settings | null, updates: Partial<Settings>): Settings => ({
                model: updates.model ?? existing?.model ?? 'gpt-3.5-turbo',
                temperature: updates.temperature ?? existing?.temperature ?? 0.7,
                temperatureSteps: updates.temperatureSteps ?? existing?.temperatureSteps ?? 10,
                maxTokens: updates.maxTokens ?? existing?.maxTokens ?? 1000,
                maxTokensSteps: updates.maxTokensSteps ?? existing?.maxTokensSteps ?? 10,
                apiKey: updates.apiKey ?? existing?.apiKey ?? '',
            });

            let newAppState = { ...prev };
            let newSessionName = currentSessionName;

            if (typeof updates === 'string') {
                newSessionName = updates.trim() || `Session ${new Date().toLocaleString()}`;
                if (updatedState) {
                    newAppState = {
                        ...newAppState,
                        ...updatedState,
                        settings: updatedState.settings ?
                            mergeSettings(newAppState.settings, updatedState.settings) :
                            newAppState.settings
                    };
                }
            } else if (updates?.settings) {
                newAppState = {
                    ...newAppState,
                    settings: mergeSettings(newAppState.settings, updates.settings)
                };
            }

            const updatedSessions = allSessions.map(session =>
                session.id === currentSessionId ? {
                    ...session,
                    name: newSessionName || session.name,
                    appState: newAppState,
                    date: Date.now()
                } : session
            );

            setAllSessions(updatedSessions);
            saveDataToStorage<Session>(updatedSessions, LOCAL_STORAGE_KEY);
            return newAppState;
        });
    }, [allSessions, currentSessionId, currentSessionName]);




    // Funktion zum Löschen einer Session
    const deleteSession = useCallback((sessionId: string) => {
        const updatedSessions = allSessions.filter(s => s.id !== sessionId);
        setAllSessions(updatedSessions);
        saveDataToStorage<Session>(updatedSessions, LOCAL_STORAGE_KEY);

        // Wenn die gelöschte Session die aktuelle war, zur neuesten verbleibenden oder zum Initialzustand wechseln
        if (currentSessionId === sessionId) {
            const latestSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
            if (latestSession) {
                loadSession(latestSession.id); // Lädt die neueste und aktualisiert die URL
            } else {
                // Keine Sessions mehr übrig
                setCurrentSessionId(null);
                setCurrentSessionName(null);
                setCurrentSession(initialSession); // Zurück zum Default
                navigate('/', {replace: true}); // Zur Hauptseite ohne ID
            }
        }
        // Wenn eine andere Session gelöscht wurde, muss nichts am aktuellen Zustand geändert werden
    }, [allSessions, currentSessionId, navigate, loadSession, initialSession]);


    // Nur die Metadaten für die Liste bereitstellen
    const sessionMetas: SessionMeta[] = allSessions.map(({id, name, date}) => ({
        id,
        name,
        date
    })).sort((a, b) => b.date - a.date); // Neueste zuerst

    const contextValue: SessionContextType = {
        sessions: sessionMetas,
        currentSessionId,
        currentSessionName,
        currentSession,
        loadSession,
        createSession,
        saveSession,
        deleteSession,
        isSessionLoading,
        initialSession
    };

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
        </SessionContext.Provider>
    );
};

// Hook für einfachen Zugriff auf den Context
export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};