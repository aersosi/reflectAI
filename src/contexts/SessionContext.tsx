import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SessionContextType, Session, SessionMeta, AppState, Settings } from "@/definitions/session";
import { loadDataFromStorage, saveDataToStorage } from "@/lib/utils";

const SessionContext = createContext<SessionContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'reactAppSessions';
type SessionProviderProps = React.FC<{ children: React.ReactNode, initialAppState: AppState }>

export const SessionProvider: SessionProviderProps = ({children, initialAppState}) => {
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [currentAppStateId, setCurrentSessionId] = useState<string | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
    const isInitialized = useRef(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    /**
     * @function useMemo callback
     * @description Finds and returns the full session object corresponding to the
     * currentAppStateId from the allSessions array. Memoized to avoid
     * recalculation unless dependencies change.
     */
    const currentAppStateData = React.useMemo(() => {
        return allSessions.find(s => s.id === currentAppStateId);
    }, [allSessions, currentAppStateId]);

    const currentAppState = currentAppStateData?.appState ?? null;
    const currentAppStateName = currentAppStateData?.name ?? null;

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

        const loadedSessions = loadDataFromStorage<Session>(LOCAL_STORAGE_KEY);
        const sessionIdFromUrl = searchParams.get('sessionId');
        let sessionToActivate: Session | undefined = undefined;
        let sessionsToSave = [...loadedSessions];

        const navigateToSession = (session: Session) => {
            if (location.pathname === '/') {
                navigate(`/?sessionId=${session.id}`, { replace: true });
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
                name: `Session ${new Date().toLocaleString()}`,
                date: Date.now(),
                appState: initialAppState,
            };
            sessionsToSave = [newSession];
            saveDataToStorage<Session>(sessionsToSave, LOCAL_STORAGE_KEY);
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
     * @description Synchronizes the currentAppStateId state with the sessionId found in the
     * URL's query parameters after the initial setup is complete and the component
     * is not in a loading state. This handles browser navigation (back/forward)
     * or manual URL changes affecting the sessionId.
     */
    useEffect(() => {
        if (!isInitialized.current || isSessionLoading) return;
        const sessionIdFromUrl = searchParams.get('sessionId');

        if (sessionIdFromUrl && sessionIdFromUrl !== currentAppStateId) {
            const sessionExists = allSessions.some(s => s.id === sessionIdFromUrl);
            if (sessionExists) setCurrentSessionId(sessionIdFromUrl);
        } else if (!sessionIdFromUrl && currentAppStateId) {
            // todo: Intentionally left blank, decide action if needed
        }

    }, [searchParams, allSessions, currentAppStateId, isSessionLoading]);

    /**
     * @function updateAndSaveSessions
     * @description Updates the `allSessions` state with the provided array of sessions
     * and simultaneously persists these changes to local storage.
     */
    const updateAndSaveSessions = (newSessions: Session[]) => {
        setAllSessions(newSessions);
        saveDataToStorage<Session>(newSessions, LOCAL_STORAGE_KEY);
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
        if (session && sessionId !== currentAppStateId) {
            setIsSessionLoading(true);
            setCurrentSessionId(session.id);
            navigate(`/?sessionId=${session.id}`, {replace: true});
            setIsSessionLoading(false);
            return true;
        }
        return false;
    }, [allSessions, navigate, currentAppStateId]);

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
            name: sessionName || `Session ${new Date().toLocaleString()}`,
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
     * @function saveSession
     * @description Saves updates to the currently active session. It can update the session name,
     * specific settings, or the entire application state. Finds the current session,
     * merges changes, updates the timestamp, and persists the updated sessions list.
     * Wrapped in useCallback for performance optimization.
     */
    const saveSession = useCallback((
        updates?: string | { settings: Partial<Settings> },
        updatedState?: AppState | null
    ) => {
        if (!currentAppStateId) return;

        const sessionIndex = allSessions.findIndex(s => s.id === currentAppStateId);
        if (sessionIndex === -1) {
            console.error("SessionProvider: Current session not found in allSessions during save.");
            return;
        }

        const currentAppStateToUpdate = allSessions[sessionIndex];

        const baseAppState: AppState = currentAppStateToUpdate.appState ?? {
            settings: null,
            systemPrompt: '',
            userPrompt: '',
            conversation: null
        };

        let finalName = currentAppStateToUpdate.name;
        let finalAppState: AppState = { ...baseAppState };

        /**
         * @function mergeSettings
         * @description Safely merges partial settings updates into existing settings,
         * providing default values for a complete settings object if none exist initially.
         */
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
            ...currentAppStateToUpdate,
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

    }, [allSessions, currentAppStateId, updateAndSaveSessions]);

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

        if (currentAppStateId === sessionId) {
            const latestSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
            if (latestSession) {
                loadSession(latestSession.id);
            } else {
                const newSession: Session = {
                    id: crypto.randomUUID(),
                    name: `Session ${new Date().toLocaleString()}`,
                    date: Date.now(),
                    appState: initialAppState
                };
                updateAndSaveSessions([newSession]);
                setCurrentSessionId(newSession.id);
                navigate(`/?sessionId=${newSession.id}`, {replace: true});
            }
        }
    }, [allSessions, currentAppStateId, navigate, loadSession, initialAppState]);


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
        currentAppStateId,
        currentAppStateName,
        currentAppState,
        loadSession,
        createSession,
        saveSession,
        deleteSession,
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