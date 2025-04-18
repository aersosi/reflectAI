import { LOCAL_STORAGE_SESSION } from "@/config/constants";
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

    /**
     * @function useMemo callback
     * @description Finds and returns the full session object corresponding to the
     * currentSessionId from the allSessions array. Memoized to avoid
     * recalculation unless dependencies change.
     */
    const currentSessionData = useMemo(() => {
        return allSessions.find(s => s.id === currentSessionId);
    }, [allSessions, currentSessionId]);

    const currentAppState = currentSessionData?.appState ?? null;
    const currentSessionName = currentSessionData?.name ?? null;

    /**
     * @useEffect hook
     * @description Handles the initial setup and loading of sessions when the component mounts
     * or key dependencies change. It loads sessions from storage, determines the session
     * to activate (from URL or most recent), creates a new session if needed, updates the URL,
     * and manages the initial loading state.
     */
    useEffect(() => {
        if (isInitialized.current) return;
        setIsSessionLoading(true);

        const loadedSessions = loadDataFromStorage<Session>(LOCAL_STORAGE_SESSION);
        const sessionIdFromUrl = searchParams.get('sessionId');
        let sessionToActivate: Session | undefined = undefined;
        let sessionsToSave = [...loadedSessions];

        const navigateToSession = (session: Session) => {
            if (location.pathname === '/') {
                navigate(`/?sessionId=${session.id}`, {replace: true});
            }
        };

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
            saveDataToStorage<Session>(sessionsToSave, LOCAL_STORAGE_SESSION);
            sessionToActivate = newSession;
            navigateToSession(newSession);
        }

        setAllSessions(sessionsToSave);
        setCurrentSessionId(sessionToActivate ? sessionToActivate.id : null);
        setIsSessionLoading(false);
        isInitialized.current = true;

    }, [initialAppState, navigate, searchParams, location.pathname]);


    /**
     * @useEffect hook
     * @description Synchronizes the currentSessionId state with the sessionId found in the
     * URL's query parameters after the initial setup is complete and the component
     * is not in a loading state. This handles browser navigation (back/forward)
     * or manual URL changes affecting the sessionId.
     */
    useEffect(() => {
        if (!isInitialized.current || isSessionLoading) return;
        const sessionIdFromUrl = searchParams.get('sessionId');

        if (sessionIdFromUrl && sessionIdFromUrl !== currentSessionId) {
            const sessionExists = allSessions.some(s => s.id === sessionIdFromUrl);
            if (sessionExists) setCurrentSessionId(sessionIdFromUrl);
        } else if (!sessionIdFromUrl && currentSessionId) {
            // todo: Intentionally left blank, decide action if needed
        }

    }, [searchParams, allSessions, currentSessionId, isSessionLoading]);

    /**
     * @function updateAndSaveSessions
     * @description Updates the `allSessions` state with the provided array of sessions
     * and simultaneously persists these changes to local storage.
     */
    const updateAndSaveSessions = (newSessions: Session[]) => {
        setAllSessions(newSessions);
        saveDataToStorage<Session>(newSessions, LOCAL_STORAGE_SESSION);
    }

    /**
     * @function loadSession
     * @description Attempts to load and activate a session specified by its ID.
     * Updates the current session ID state, navigates to the corresponding URL,
     * manages loading state, and returns true on success, false otherwise.
     * Wrapped in useCallback for performance optimization.
     */
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

    /**
     * @function createSession
     * @description Creates a new session with a specified name and initial state.
     * Generates a unique ID, adds the session to the list, saves it,
     * sets it as the current session, updates the URL, and manages loading state.
     * Wrapped in useCallback for performance optimization.
     */
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

    /**
     * @function updateSession
     * @description ????
     */
    const updateSession = useCallback((path: string, value: any) => {
        if (!currentSessionId) {
            console.error("SaveSession Error: No current session ID.");
            return;
        }

        const sessionIndex = allSessions.findIndex(s => s.id === currentSessionId);
        if (sessionIndex === -1) {
            console.error("SaveSession Error: Current session not found in allSessions.");
            return;
        }

        const currentSessionToUpdate = allSessions[sessionIndex];
        const updatedSession = { ...currentSessionToUpdate };

        try {
            const keys = path.split('.');
            let currentLevel: any = updatedSession;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];

                if (typeof currentLevel[key] !== 'object' || currentLevel[key] === null) {
                    console.error(`SaveSession Error: Invalid path segment "${key}" in path "${path}". Not an object.`);
                    return;
                }

                currentLevel[key] = { ...currentLevel[key] };
                currentLevel = currentLevel[key];
            }

            const finalKey = keys[keys.length - 1];

            // Special case: add value as next numeric key
            if (path === "appState.messagesHistory") {
                const existing = currentLevel[finalKey] || {};
                const numericKeys = Object.keys(existing).map(Number).filter(k => !isNaN(k));
                const nextKey = numericKeys.length > 0 ? Math.max(...numericKeys) + 1 : 0;

                currentLevel[finalKey] = {
                    ...existing,
                    [nextKey]: value,
                };
            } else {
                currentLevel[finalKey] = value;
            }

            updatedSession.date = Date.now();

            const updatedSessions = [
                ...allSessions.slice(0, sessionIndex),
                updatedSession,
                ...allSessions.slice(sessionIndex + 1)
            ];

            updateAndSaveSessions(updatedSessions);

        } catch (error) {
            console.error(`SaveSession Error: Failed to update path "${path}".`, error);
        }
    }, [allSessions, currentSessionId, updateAndSaveSessions]);

    /**
     * @function deleteSession
     * @description Deletes a session specified by its ID. Removes the session from the list
     * and saves the updated list. If the deleted session was the currently active one,
     * it activates the most recent remaining session or creates a new one if none are left.
     * Wrapped in useCallback for performance optimization.
     */
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


    // const findNestedObj = (entireObj, keyToFind, valToFind) => {
    //     let foundObj;
    //     JSON.stringify(entireObj, (_, nestedValue) => {
    //         if (nestedValue && nestedValue[keyToFind] === valToFind) {
    //             foundObj = nestedValue;
    //         }
    //         return nestedValue;
    //     });
    //     return foundObj;
    // };

    const deleteMessage = useCallback((messageId: string): void => {
        const updatedSessions = JSON.parse(JSON.stringify(allSessions)); // Deep clone
        JSON.stringify(updatedSessions, function (_, value) {
            if (
                value &&
                typeof value === 'object' &&
                value["id"] === messageId
            ) {
                if (this && typeof this === 'object') {
                    for (const prop in this) {
                        if (this[prop] === value) {
                            delete this[prop];
                        }
                    }
                }
            }
            return value;
        });

        updateAndSaveSessions(updatedSessions);
    }, [allSessions, updateAndSaveSessions]);


    /**
     * @description Derives a sorted list of session metadata (id, name, date)
     * from the `allSessions` state, suitable for display purposes (e.g., in a sidebar list).
     * The map function extracts the required metadata from each full session object.
     */
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
        loadSession,
        createSession,
        updateSession,
        deleteSession,
        // deleteMessage,
        isSessionLoading,
        initialAppState
    };

    return (
        <SessionContext.Provider value={contextValue}>
            {!isSessionLoading ? children : <div>Loading Session...</div>}
        </SessionContext.Provider>
    );
};

/**
 * @function useSession
 * @description Custom hook to easily consume the SessionContext within components.
 * It retrieves the context value and throws an error if used outside of a SessionProvider,
 * ensuring proper usage.
 */
export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (context === undefined) throw new Error('useSession must be used within a SessionProvider');
    return context;
};