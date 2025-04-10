import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SessionContextType, Session, SessionMeta, AppState } from "@/definitions/session";

// Hier den Context exportieren
const SessionContext = createContext<SessionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'reactAppSessions';

// Helper zum Lesen aus localStorage
const loadSessionsFromStorage = (): Session[] => {
    try {
        const storedSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
        return storedSessions ? JSON.parse(storedSessions) : [];
    } catch (error) {
        console.error("Error loading sessions from localStorage:", error);
        return [];
    }
};

// Helper zum Schreiben in localStorage
const saveSessionsToStorage = (sessions: Session[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error("Error saving sessions to localStorage:", error);
        // Optional: Informiere den Nutzer über das Problem (z.B. Speicher voll)
    }
};

export const SessionProvider: React.FC<{ children: React.ReactNode, defaultInitialState: AppState }> = ({
                                                                                                            children,
                                                                                                            defaultInitialState
                                                                                                        }) => {
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentSessionName, setCurrentSessionName] = useState<string | null>(null);
    const [currentAppState, setCurrentAppState] = useState<AppState | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true); // Startet als true

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initiales Laden der Sessions und Bestimmen der Start-Session
    useEffect(() => {
        setIsSessionLoading(true);
        const storedSessions = loadSessionsFromStorage();
        setAllSessions(storedSessions);

        const sessionIdFromUrl = searchParams.get('sessionId');

        let sessionToLoad: Session | null = null;

        if (sessionIdFromUrl) {
            sessionToLoad = storedSessions.find(s => s.id === sessionIdFromUrl) || null;
            if (!sessionToLoad) {
                console.warn(`Session ID "${sessionIdFromUrl}" from URL not found.`);
                // Optional: Auf Hauptseite redirecten oder Fehler anzeigen
                navigate('/', {replace: true}); // Gehe zur Hauptseite wenn ID ungültig
            }
        }

        // Wenn keine gültige ID in URL, lade die letzte Session
        if (!sessionToLoad && storedSessions.length > 0) {
            // Finde die neuste Session (höchster Timestamp)
            sessionToLoad = [...storedSessions].sort((a, b) => b.date - a.date)[0];
            // Optional: URL aktualisieren auf die ID der geladenen Session?
            // navigate(`/?sessionId=${sessionToLoad.id}`, { replace: true });
        }

        if (sessionToLoad) {
            setCurrentSessionId(sessionToLoad.id);
            setCurrentSessionName(sessionToLoad.name);
            setCurrentAppState(sessionToLoad.appState);
        } else {
            // Keine Sessions vorhanden oder keine spezifische geladen -> Initialzustand
            setCurrentSessionId(null);
            setCurrentAppState(defaultInitialState); // Oder null, je nach Bedarf
        }
        setIsSessionLoading(false);
    }, [searchParams, navigate, defaultInitialState]); // Abhängigkeit von searchParams, damit es bei URL-Änderung neu prüft

    // Funktion zum Laden einer spezifischen Session
    const loadSession = useCallback((sessionId: string): boolean => {
        const session = allSessions.find(s => s.id === sessionId);
        if (session) {
            setIsSessionLoading(true);
            setCurrentSessionId(session.id);
            setCurrentSessionName(session.name);
            setCurrentAppState(session.appState);
            // Update URL ohne Neuladen der Seite (falls noch nicht geschehen)
            if (searchParams.get('sessionId') !== sessionId) {
                navigate(`/?sessionId=${sessionId}`, {replace: true}); // replace:true ändert nicht den Browser-Verlauf
            }
            setIsSessionLoading(false);
            return true;
        }
        console.warn(`Session with ID ${sessionId} not found for loading.`);
        return false;
    }, [allSessions, navigate, searchParams]);

    // Funktion zum Erstellen einer neuen Session
    const createSession = useCallback((sessionName: string, initialState: AppState) => {
        setIsSessionLoading(true);
        const newSession: Session = {
            id: crypto.randomUUID(), // Moderne Methode für eindeutige IDs
            name: sessionName || `Session ${new Date().toLocaleString()}`, // Fallback-Name
            date: Date.now(), // Unix Timestamp in Millisekunden
            appState: initialState, // Startet mit dem übergebenen Initialzustand
        };

        const updatedSessions = [...allSessions, newSession];
        setAllSessions(updatedSessions);
        saveSessionsToStorage(updatedSessions);

        // Direkt zur neuen Session wechseln und URL aktualisieren
        setCurrentSessionId(newSession.id);
        setCurrentSessionName(newSession.name);
        setCurrentAppState(newSession.appState);
        navigate(`/?sessionId=${newSession.id}`, {replace: true});
        setIsSessionLoading(false);
    }, [allSessions, navigate]);

    // Funktion zum Speichern des aktuellen Zustands der aktiven Session
    const saveCurrentSession = useCallback((sessionName: string, updatedState: AppState | null) => {
        if (!currentSessionId) {
            console.warn("Cannot save state: No session is currently loaded.");
            // Optional: Automatisch neue Session erstellen? Oder Fehler anzeigen?
            // Vielleicht hier createSession aufrufen?
            // createSession("Auto-Saved Session", updatedState);
            return;
        }

        const updatedSessions = allSessions.map(session =>
            session.id === currentSessionId
                ? {
                    ...session,
                    name: sessionName || `Session ${new Date().toLocaleString()}`,
                    appState: updatedState,
                    date: Date.now()
                } // Update state and timestamp
                : session
        );

        setAllSessions(updatedSessions);
        setCurrentAppState(updatedState); // Auch den lokalen State im Context aktualisieren
        saveSessionsToStorage(updatedSessions);
    }, [currentSessionId, allSessions]);

    // Funktion zum Löschen einer Session
    const deleteSession = useCallback((sessionId: string) => {
        const updatedSessions = allSessions.filter(s => s.id !== sessionId);
        setAllSessions(updatedSessions);
        saveSessionsToStorage(updatedSessions);

        // Wenn die gelöschte Session die aktuelle war, zur neuesten verbleibenden oder zum Initialzustand wechseln
        if (currentSessionId === sessionId) {
            const latestSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
            if (latestSession) {
                loadSession(latestSession.id); // Lädt die neueste und aktualisiert die URL
            } else {
                // Keine Sessions mehr übrig
                setCurrentSessionId(null);
                setCurrentSessionName(null);
                setCurrentAppState(defaultInitialState); // Zurück zum Default
                navigate('/', {replace: true}); // Zur Hauptseite ohne ID
            }
        }
        // Wenn eine andere Session gelöscht wurde, muss nichts am aktuellen Zustand geändert werden
    }, [allSessions, currentSessionId, navigate, loadSession, defaultInitialState]);


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
        currentAppState,
        loadSession,
        createSession,
        saveCurrentSession,
        deleteSession,
        isSessionLoading,
        defaultInitialState
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