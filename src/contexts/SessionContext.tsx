import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SessionContextType, Session, SessionMeta, AppState, Settings } from "@/definitions/session";
import { loadDataFromStorage, saveDataToStorage } from "@/lib/utils";

const SessionContext = createContext<SessionContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'reactAppSessions';
type SessionProviderProps = React.FC<{ children: React.ReactNode, initialSession: AppState }>

export const SessionProvider: SessionProviderProps = ({children, initialSession}) => {
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
    const isInitialized = useRef(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const currentSessionData = React.useMemo(() => {
        return allSessions.find(s => s.id === currentSessionId);
    }, [allSessions, currentSessionId]);

    const currentSession = currentSessionData?.appState ?? null;
    const currentSessionName = currentSessionData?.name ?? null;

    useEffect(() => {
        setIsSessionLoading(true);
        const storedSessions = loadDataFromStorage<Session>(LOCAL_STORAGE_KEY);
        setAllSessions(storedSessions);

        const sessionIdFromUrl = searchParams.get('sessionId');
        let sessionToActivate: Session | undefined = undefined;

        if (sessionIdFromUrl) sessionToActivate = storedSessions.find(s => s.id === sessionIdFromUrl);

        if (!sessionToActivate && storedSessions.length > 0) {
            sessionToActivate = [...storedSessions].sort((a, b) => b.date - a.date)[0];
            if (sessionToActivate && location.pathname === '/') navigate(`/?sessionId=${sessionToActivate.id}`, {replace: true});
        }

        if (!sessionToActivate) {
            const newSession: Session = {
                id: crypto.randomUUID(),
                name: `Session ${new Date().toLocaleString()}`,
                date: Date.now(),
                appState: initialSession,
            };
            const updatedSessions = [newSession];
            setAllSessions(updatedSessions);
            saveDataToStorage<Session>(updatedSessions, LOCAL_STORAGE_KEY);
            sessionToActivate = newSession;
            if (location.pathname === '/') navigate(`/?sessionId=${newSession.id}`, {replace: true});
        }

        setCurrentSessionId(sessionToActivate ? sessionToActivate.id : null);

        setIsSessionLoading(false);
        isInitialized.current = true;

    }, [initialSession, navigate, location.pathname]);

    useEffect(() => {
        if (!isInitialized.current || isSessionLoading) return;

        const sessionIdFromUrl = searchParams.get('sessionId');

        if (sessionIdFromUrl && sessionIdFromUrl !== currentSessionId) {
            const sessionExists = allSessions.some(s => s.id === sessionIdFromUrl);
            if (sessionExists) {
                setCurrentSessionId(sessionIdFromUrl);
            } else {
                console.warn(`SessionProvider: Session ID ${sessionIdFromUrl} from URL not found.`);
            }
        } else if (!sessionIdFromUrl && currentSessionId) {
            // todo: Intentionally left blank, decide action if needed
        }

    }, [searchParams, allSessions, currentSessionId, isSessionLoading]);

    const updateAndSaveSessions = (newSessions: Session[]) => {
        setAllSessions(newSessions);
        saveDataToStorage<Session>(newSessions, LOCAL_STORAGE_KEY);
    }

    const loadSession = useCallback((sessionId: string): boolean => {
        const session = allSessions.find(s => s.id === sessionId);
        if (session && sessionId !== currentSessionId) {
            setIsSessionLoading(true);
            setCurrentSessionId(session.id);
            navigate(`/?sessionId=${session.id}`, {replace: true});
            setIsSessionLoading(false);
            return true;
        }
        return false;
    }, [allSessions, navigate, currentSessionId]);

    const createSession = useCallback((sessionName: string, initialState: AppState) => {
        setIsSessionLoading(true);
        const newSession: Session = {
            id: crypto.randomUUID(),
            name: sessionName || `Session ${new Date().toLocaleString()}`,
            date: Date.now(),
            appState: initialState,
        };

        const updatedSessions = [...allSessions, newSession];
        updateAndSaveSessions(updatedSessions);
        setCurrentSessionId(newSession.id);
        navigate(`/?sessionId=${newSession.id}`, {replace: true});
        setIsSessionLoading(false);
    }, [allSessions, navigate, initialSession]);

    const saveSession = useCallback((
        updates?: string | { settings: Partial<Settings> },
        updatedState?: AppState | null
    ) => {
        if (!currentSessionId) return;

        const sessionIndex = allSessions.findIndex(s => s.id === currentSessionId);
        if (sessionIndex === -1) {
            console.error("SessionProvider: Current session not found in allSessions during save.");
            return;
        }

        const currentSessionToUpdate = allSessions[sessionIndex];

        const baseAppState: AppState = currentSessionToUpdate.appState ?? {
            settings: null,
            systemPrompt: '',
            userPrompt: '',
            conversation: null
        };

        let finalName = currentSessionToUpdate.name;
        let finalAppState: AppState = { ...baseAppState };

        const mergeSettings = (existing: Settings | null, partialUpdates: Partial<Settings>): Settings | null => {
            const base = existing ?? {
                model: 'default-model',
                temperature: 0.7,
                temperatureSteps: 10,
                maxTokens: 1000,
                maxTokensSteps: 10,
                apiKey: '',
            };

            return {
                ...base,
                ...partialUpdates
            };
        };

        if (typeof updates === 'string') {
            finalName = updates.trim() || `Session ${new Date().toLocaleString()}`;
            if (updatedState !== undefined) {
                finalAppState = updatedState === null
                    ? { settings: null, systemPrompt: '', userPrompt: '', conversation: null }
                    : { ...updatedState, settings: updatedState.settings ?? null };
            }

        } else if (updates?.settings) {
            finalAppState = {
                ...finalAppState,
                settings: mergeSettings(finalAppState.settings, updates.settings)
            };

        } else if (updatedState !== undefined) {
            finalAppState = updatedState === null
                ? { settings: null, systemPrompt: '', userPrompt: '', conversation: null }
                : { ...updatedState, settings: updatedState.settings ?? null };
        }

        const updatedSession: Session = {
            ...currentSessionToUpdate,
            name: finalName,
            appState: finalAppState,
            date: Date.now()
        };

        const updatedSessions = [
            ...allSessions.slice(0, sessionIndex),
            updatedSession,
            ...allSessions.slice(sessionIndex + 1)
        ];

        updateAndSaveSessions(updatedSessions);

    }, [allSessions, currentSessionId, updateAndSaveSessions]);

    const deleteSession = useCallback((sessionId: string) => {
        const updatedSessions = allSessions.filter(s => s.id !== sessionId);
        updateAndSaveSessions(updatedSessions);

        if (currentSessionId === sessionId) {
            const latestSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
            if (latestSession) {
                loadSession(latestSession.id);
            } else {
                const newSession: Session = {
                    id: crypto.randomUUID(),
                    name: `Session ${new Date().toLocaleString()}`,
                    date: Date.now(),
                    appState: initialSession
                };
                updateAndSaveSessions([newSession]);
                setCurrentSessionId(newSession.id);
                navigate(`/?sessionId=${newSession.id}`, {replace: true});
            }
        }
    }, [allSessions, currentSessionId, navigate, loadSession, initialSession]);


    const sessionMetas: SessionMeta[] = allSessions.map(({id, name, date}) => ({
        id,
        name,
        date
    })).sort((a, b) => b.date - a.date);

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
            {!isSessionLoading ? children : <div>Loading Session...</div>}
        </SessionContext.Provider>
    );
};

export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (context === undefined) throw new Error('useSession must be used within a SessionProvider');
    return context;
};