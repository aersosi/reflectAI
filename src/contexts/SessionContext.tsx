import { LOCAL_STORAGE_SESSION } from "@/config/constants";
import { AnthropicResponse } from "@/definitions/api";
import { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo, FC, ReactNode } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SessionContextType, Session, SessionMeta, AppState } from "@/definitions/session";
import { loadDataFromStorage, saveDataToStorage } from "@/lib/utils";

const SessionContext = createContext<SessionContextType | undefined>(undefined);
type SessionProviderProps = FC<{ children: ReactNode, initialAppState: AppState }>

export const SessionProvider: SessionProviderProps = ({children, initialAppState}) => {
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
    const isInitialized = useRef(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const currentSessionData = useMemo(() => {
        return allSessions.find(s => s.id === currentSessionId);
    }, [allSessions, currentSessionId]);

    const currentAppState = currentSessionData?.appState;
    const currentSessionName = currentSessionData?.name;
    const currentMessagesHistory = currentAppState?.messagesHistory;

    useEffect(() => {
        if (isInitialized.current) return;
        setIsSessionLoading(true);

        const loadedSessions = loadDataFromStorage<Session>(LOCAL_STORAGE_SESSION);
        const sessionIdFromUrl = searchParams.get('sessionId');
        let sessionToActivate: Session | undefined = undefined;
        let sessionsToSave = [...loadedSessions];

        if (sessionIdFromUrl) {
            sessionToActivate = loadedSessions.find(s => s.id === sessionIdFromUrl);
        }

        if (!sessionToActivate && loadedSessions.length > 0) {
            sessionToActivate = [...loadedSessions].sort((a, b) => b.date - a.date)[0];
            if (sessionToActivate) {
                navigateToSession(sessionToActivate);
            }
        }

        if (!sessionToActivate) {
            const newSession: Session = {
                id: crypto.randomUUID(),
                name: "New Session",
                date: Date.now(),
                appState: initialAppState,
            };
            sessionsToSave = [newSession];
            sessionToActivate = newSession;
            navigateToSession(newSession);
        }

        setAllSessions(sessionsToSave);
        setCurrentSessionId(sessionToActivate ? sessionToActivate.id : null);
        setIsSessionLoading(false);
        isInitialized.current = true;

    }, [initialAppState, navigate, searchParams, location.pathname]);
    useEffect(() => {
        if (!isInitialized.current || isSessionLoading) return;
        const sessionIdFromUrl = searchParams.get('sessionId');

        if (sessionIdFromUrl !== currentSessionId) {
            const sessionExists = allSessions.some(s => s.id === sessionIdFromUrl);
            if (sessionExists) setCurrentSessionId(sessionIdFromUrl);
        } else if (!sessionIdFromUrl && currentSessionId) {
            // todo: Intentionally left blank, decide action if needed
        }

    }, [searchParams, allSessions, currentSessionId, isSessionLoading]);
    useEffect(() => {
        if (isInitialized.current) saveDataToStorage<Session>(allSessions, LOCAL_STORAGE_SESSION);
    }, [allSessions]);

    const navigateToSession = (session: Session) => {
        if (location.pathname === '/') {
            navigate(`/?sessionId=${session.id}`, {replace: true});
        }
    };

    const updateAndSaveSessions = (newSessions: Session[]) => {
        setAllSessions(newSessions);
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
            name: sessionName || "New Session",
            date: Date.now(),
            appState: initialState,
        };

        const updatedSessions = [...allSessions, newSession];
        updateAndSaveSessions(updatedSessions);
        setCurrentSessionId(newSession.id);
        navigate(`/?sessionId=${newSession.id}`, {replace: true});
        setIsSessionLoading(false);
    }, [allSessions, navigate, initialAppState]);

    const appendToMessagesHistory = useCallback((response: AnthropicResponse) => {
        if (!currentSessionId) {
            console.error("appendToMessagesHistory Error: No current session ID.");
            return;
        }

        const sessionIndex = allSessions.findIndex(s => s.id === currentSessionId);
        if (sessionIndex === -1) {
            console.error("appendToMessagesHistory Error: Current session not found in allSessions.");
            return;
        }

        const session = { ...allSessions[sessionIndex] };
        const messages = Array.isArray(session.appState?.messagesHistory)
            ? [...session.appState.messagesHistory]
            : [];

        session.appState = {
            ...session.appState,
            messagesHistory: [...messages, response]
        };
        session.date = Date.now();

        const updatedSessions = [
            ...allSessions.slice(0, sessionIndex),
            session,
            ...allSessions.slice(sessionIndex + 1)
        ];

        updateAndSaveSessions(updatedSessions);
    }, [allSessions, currentSessionId, updateAndSaveSessions]);

    const overwriteSession = useCallback((path: string, value: any) => {
        if (!currentSessionId) {
            console.error("overwriteSession Error: No current session ID.");
            return;
        }

        const sessionIndex = allSessions.findIndex(s => s.id === currentSessionId);
        if (sessionIndex === -1) {
            console.error("overwriteSession Error: Current session not found in allSessions.");
            return;
        }

        const updatedSession = { ...allSessions[sessionIndex] };

        try {
            const keys = path.split('.');
            let currentLevel: any = updatedSession;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];

                if (typeof currentLevel[key] !== 'object' || currentLevel[key] === null) {
                    console.error(`overwriteSession Error: Invalid path segment "${key}" in path "${path}". Not an object.`);
                    return;
                }

                currentLevel[key] = { ...currentLevel[key] };
                currentLevel = currentLevel[key];
            }

            const finalKey = keys[keys.length - 1];
            currentLevel[finalKey] = value;

            updatedSession.date = Date.now();

            const updatedSessions = [
                ...allSessions.slice(0, sessionIndex),
                updatedSession,
                ...allSessions.slice(sessionIndex + 1)
            ];

            updateAndSaveSessions(updatedSessions);

        } catch (error) {
            console.error(`overwriteSession Error: Failed to update path "${path}".`, error);
        }
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
                    name: "New Session",
                    date: Date.now(),
                    appState: initialAppState
                };
                updateAndSaveSessions([newSession]);
                setCurrentSessionId(newSession.id);
                navigate(`/?sessionId=${newSession.id}`, {replace: true});
            }
        }
    }, [allSessions, currentSessionId, navigate, loadSession, initialAppState]);

    const deleteMessage = useCallback((messageId: string): void => {
        const updatedSessions = JSON.parse(JSON.stringify(allSessions)); // Deep clone

        JSON.stringify(updatedSessions, function (_, value) {
            if (
                value &&
                typeof value === 'object' &&
                value["id"] === messageId
            ) {
                if (this && typeof this === 'object') {
                    if (Array.isArray(this)) {
                        const index = this.indexOf(value);
                        if (index > -1) {
                            this.splice(index, 1); // ✅ remove from array
                        }
                    } else {
                        for (const prop in this) {
                            if (this[prop] === value) {
                                delete this[prop]; // ✅ remove from object
                            }
                        }
                    }
                }
            }
            return value;
        });

        updateAndSaveSessions(updatedSessions);
    }, [allSessions, updateAndSaveSessions]);

    const sessionMetas: SessionMeta[] = allSessions.map(({id, name, date}) => ({
        id,
        name,
        date
    })).sort((a, b) => b.date - a.date);

    const contextValue: SessionContextType = {
        sessions: sessionMetas,
        currentSessionId,
        currentSessionName,
        currentAppState,
        currentMessagesHistory,
        loadSession,
        createSession,
        overwriteSession,
        appendToMessagesHistory,
        deleteSession,
        deleteMessage,
        isSessionLoading,
        initialAppState
    };

    return (
        <SessionContext.Provider value={contextValue}>
            {!isSessionLoading ? children : <div>Loading Session ...</div>}
        </SessionContext.Provider>
    );
};

export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (context === undefined) throw new Error('useSession must be used within a SessionProvider');
    return context;
};