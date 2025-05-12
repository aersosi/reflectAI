import { LOCAL_STORAGE_SESSION } from "@/config/constants";
import { nanoid } from "nanoid";
import { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo, FC, ReactNode } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SessionContextType, Session, SessionMeta, AppState, Message } from "@/definitions/session";
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
    const currentSessionName = currentSessionData?.title;
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
                id: `session_${nanoid(12)}`,
                title: "New Session",
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
        if (isInitialized.current) {
            saveDataToStorage<Session>(allSessions, LOCAL_STORAGE_SESSION);
        }
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
            id: `session_${nanoid(12)}`,
            title: sessionName || "New Session",
            date: Date.now(),
            appState: initialState,
        };

        const updatedSessions = [...allSessions, newSession];
        updateAndSaveSessions(updatedSessions);
        setCurrentSessionId(newSession.id);
        navigate(`/?sessionId=${newSession.id}`, {replace: true});
        setIsSessionLoading(false);
    }, [allSessions, navigate, initialAppState]);

    const appendToMessagesHistory = useCallback((newMessage: Message) => {
        setAllSessions(prevSessions => {
            const sessionIndex = prevSessions.findIndex(s => s.id === currentSessionId);
            if (sessionIndex === -1) {
                console.error("appendToMessagesHistory Error: Current session not found in allSessions.");
                return prevSessions;
            }

            const prevSession = prevSessions[sessionIndex];
            const prevMessages = Array.isArray(prevSession.appState?.messagesHistory)
                ? prevSession.appState.messagesHistory
                : [];

            // Message has same id?
            const existingIndex = prevMessages.findIndex(msg => msg.id === newMessage.id);
            let updatedMessages;

            if (existingIndex !== -1) {
                // overwrite
                updatedMessages = [
                    ...prevMessages.slice(0, existingIndex),
                    newMessage,
                    ...prevMessages.slice(existingIndex + 1)
                ];
            } else {
                // append
                updatedMessages = [...prevMessages, newMessage];
            }

            const updatedSession = {
                ...prevSession,
                appState: {
                    ...prevSession.appState,
                    messagesHistory: updatedMessages
                },
                date: Date.now()
            };

            return [
                ...prevSessions.slice(0, sessionIndex),
                updatedSession,
                ...prevSessions.slice(sessionIndex + 1)
            ];
        });
    }, [currentSessionId]);

    const overwriteSession = useCallback((path: string, value: any) => {
        setAllSessions(prevSessions => {
            const sessionIndex = prevSessions.findIndex(s => s.id === currentSessionId);
            if (sessionIndex === -1) {
                console.error("error: Current session not found.");
                return prevSessions;
            }
            const updatedSession = {...prevSessions[sessionIndex]};

            try {
                const keys = path.split('.');
                let currentLevel: any = updatedSession;

                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    if (typeof currentLevel[key] !== 'object' || currentLevel[key] === null) {
                        console.error(`error: Invalid path segment "${key}" in path "${path}". Not an object.`);
                        return prevSessions;
                    }
                    currentLevel[key] = {...currentLevel[key]};
                    currentLevel = currentLevel[key];
                }

                const finalKey = keys[keys.length - 1];
                currentLevel[finalKey] = value;

                updatedSession.date = Date.now();

                return [
                    ...prevSessions.slice(0, sessionIndex),
                    updatedSession,
                    ...prevSessions.slice(sessionIndex + 1)
                ];

            } catch (error) {
                console.error(`error: Failed to update path "${path}".`, error);
                return prevSessions;
            }
        });
    }, [currentSessionId]);

    const deleteSession = useCallback((sessionId: string) => {
        const updatedSessions = allSessions.filter(s => s.id !== sessionId);
        updateAndSaveSessions(updatedSessions);

        if (currentSessionId === sessionId) {
            const latestSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
            if (latestSession) {
                loadSession(latestSession.id);
            } else {
                const newSession: Session = {
                    id: `session_${nanoid(12)}`,
                    title: "New Session",
                    date: Date.now(),
                    appState: initialAppState
                };
                updateAndSaveSessions([newSession]);
                setCurrentSessionId(newSession.id);
                navigate(`/?sessionId=${newSession.id}`, {replace: true});
            }
        }
    }, [allSessions, currentSessionId, navigate, loadSession, initialAppState]);

    const deleteMessage = useCallback((id: string): void => {
        setAllSessions(prevSessions => {
            const updatedSessions = JSON.parse(JSON.stringify(prevSessions)); // Deep clone

            JSON.stringify(updatedSessions, function (_, value) {
                if (
                    value &&
                    typeof value === 'object' &&
                    value["id"] === id
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

            return updatedSessions;
        });
    }, []);

    const appendSessionVariable = useCallback((path: string, value: any, id: string) => {
        setAllSessions(prevSessions => {
            const sessionIndex = prevSessions.findIndex(s => s.id === currentSessionId);
            if (sessionIndex === -1) {
                console.error("error: Current session not found.");
                return prevSessions;
            }

            const updatedSession = {...prevSessions[sessionIndex]};
            const newVariable = {
                id: id,
                title: value.title,
                text: value.text
            };

            try {
                const keys = path.split('.');
                let currentLevel: any = updatedSession;

                // Navigate to the target array
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (i === keys.length - 1) {
                        // At the target array, append the new variable
                        if (!Array.isArray(currentLevel[key])) {
                            console.error(`error: Target "${key}" is not an array.`);
                            return prevSessions;
                        }
                        currentLevel[key] = [...currentLevel[key], newVariable];
                    } else {
                        if (typeof currentLevel[key] !== 'object' || currentLevel[key] === null) {
                            console.error(`error: Invalid path segment "${key}" in path "${path}".`);
                            return prevSessions;
                        }
                        currentLevel[key] = {...currentLevel[key]};
                        currentLevel = currentLevel[key];
                    }
                }

                updatedSession.date = Date.now();

                return [
                    ...prevSessions.slice(0, sessionIndex),
                    updatedSession,
                    ...prevSessions.slice(sessionIndex + 1)
                ];

            } catch (error) {
                console.error(`error: Failed to append to path "${path}".`, error);
                return prevSessions;
            }
        });
    }, [currentSessionId]);

    const deleteSessionVariable = useCallback((id: string, isUser: boolean = false) => {
        setAllSessions(prevSessions => {
            const sessionIndex = prevSessions.findIndex(s => s.id === currentSessionId);
            if (sessionIndex === -1) {
                console.error("deleteSessionVariable Error: Current session not found.");
                return prevSessions;
            }

            const updatedSession = {...prevSessions[sessionIndex]};

            const updatedAppState = updatedSession.appState;
            const variables = isUser ? updatedAppState?.userVariables?.variables : updatedAppState?.systemVariables?.variables;


            if (!Array.isArray(variables)) {
                console.error(`error: ${isUser ? "User" : "System"} variables array not found.`);
                return prevSessions;
            }

            const variableIndex = variables.findIndex(v => v.id === id);
            if (variableIndex === -1) {
                console.error(`deleteSessionVariable Error: Variable with id "${id}" not found.`);
                return prevSessions;
            }

            // Remove the variable at the found index
            const updatedVariables = [
                ...variables.slice(0, variableIndex),
                ...variables.slice(variableIndex + 1)
            ];

            if (isUser) {
                updatedSession.appState = {
                    ...updatedSession.appState,
                    userVariables: {
                        ...updatedSession.appState.userVariables,
                        variables: updatedVariables
                    }
                };
            } else {
                updatedSession.appState = {
                    ...updatedSession.appState,
                    systemVariables: {
                        ...updatedSession.appState.systemVariables,
                        variables: updatedVariables
                    }
                };
            }


            updatedSession.date = Date.now();

            return [
                ...prevSessions.slice(0, sessionIndex),
                updatedSession,
                ...prevSessions.slice(sessionIndex + 1)
            ];
        });
    }, [currentSessionId]);

    const overwriteSessionVariableText = useCallback((id: string, text: string, isUser: boolean = false) => {
        setAllSessions(prevSessions => {
            const sessionIndex = prevSessions.findIndex(s => s.id === currentSessionId);
            if (sessionIndex === -1) {
                console.error("error: Current session not found.");
                return prevSessions;
            }

            const updatedSession = {...prevSessions[sessionIndex]};

            const updatedAppState = updatedSession.appState;
            const variables = isUser ? updatedAppState?.userVariables?.variables : updatedAppState?.systemVariables?.variables;

            if (!Array.isArray(variables)) {
                console.error(`error: ${isUser ? "User" : "System"} variables array not found.`);
                return prevSessions;
            }

            const variableIndex = variables.findIndex(v => v.id === id);
            if (variableIndex === -1) {
                console.error(`error: Variable with id "${id}" not found.`);
                return prevSessions;
            }

            // Update the specific variable's text
            const updatedVariables = [...variables];
            updatedVariables[variableIndex] = {
                ...updatedVariables[variableIndex],
                text
            };

            if (isUser) {
                updatedSession.appState = {
                    ...updatedSession.appState,
                    userVariables: {
                        ...updatedSession.appState.userVariables,
                        variables: updatedVariables
                    }
                };
            } else {
                updatedSession.appState = {
                    ...updatedSession.appState,
                    systemVariables: {
                        ...updatedSession.appState.systemVariables,
                        variables: updatedVariables
                    }
                };
            }

            updatedSession.date = Date.now();

            return [
                ...prevSessions.slice(0, sessionIndex),
                updatedSession,
                ...prevSessions.slice(sessionIndex + 1)
            ];
        });
    }, [currentSessionId]);

    const sessionMetas: SessionMeta[] = allSessions.map(({id, title, date}) => ({
        id,
        title,
        date
    })).sort((a, b) => b.date - a.date);

    const contextValue: SessionContextType = {
        // todo: what props to expose and which not?
        sessions: sessionMetas,

        currentSessionId,
        currentSessionName,
        initialAppState,
        currentAppState,

        loadSession,
        createSession,
        overwriteSession,
        deleteSession,

        currentMessagesHistory,
        appendToMessagesHistory,
        deleteMessage,

        appendSessionVariable,
        deleteSessionVariable,
        overwriteSessionVariableText,

        isSessionLoading
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