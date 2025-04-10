import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SessionContextType, Session, SessionMeta, AppState } from "@/definitions/session";
import { loadSessionsFromStorage, saveSessionsToStorage } from "@/lib/utils.ts";

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'reactAppSessions';

type SessionProviderProps = React.FC<{ children: React.ReactNode, initialAppState: AppState }>

export const SessionProvider: SessionProviderProps = ({children, initialAppState}) => {
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
        const storedSessions = loadSessionsFromStorage<Session>(LOCAL_STORAGE_KEY);
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
            setCurrentAppState(initialAppState); // Oder null, je nach Bedarf
        }
        setIsSessionLoading(false);
    }, [searchParams, navigate, initialAppState]); // Abhängigkeit von searchParams, damit es bei URL-Änderung neu prüft

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
        saveSessionsToStorage<Session>(updatedSessions, LOCAL_STORAGE_KEY);

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
            return;
        }

        // Stelle sicher, dass der Name nicht leer ist, sonst Fallback
        const validatedSessionName = sessionName.trim() || `Session ${new Date().toLocaleString()}`;

        const updatedSessions = allSessions.map(session =>
            session.id === currentSessionId
                ? {
                    ...session,
                    name: validatedSessionName, // Verwende den validierten Namen
                    appState: updatedState, // Nimm den übergebenen App-State
                    date: Date.now()        // Aktualisiere das Datum
                }
                : session
        );

        setAllSessions(updatedSessions);
        setCurrentAppState(updatedState);
        setCurrentSessionName(validatedSessionName);
        saveSessionsToStorage<Session>(updatedSessions, LOCAL_STORAGE_KEY);
    }, [currentSessionId, allSessions]);

    // Funktion zum Löschen einer Session
    const deleteSession = useCallback((sessionId: string) => {
        const updatedSessions = allSessions.filter(s => s.id !== sessionId);
        setAllSessions(updatedSessions);
        saveSessionsToStorage<Session>(updatedSessions, LOCAL_STORAGE_KEY);

        // Wenn die gelöschte Session die aktuelle war, zur neuesten verbleibenden oder zum Initialzustand wechseln
        if (currentSessionId === sessionId) {
            const latestSession = [...updatedSessions].sort((a, b) => b.date - a.date)[0];
            if (latestSession) {
                loadSession(latestSession.id); // Lädt die neueste und aktualisiert die URL
            } else {
                // Keine Sessions mehr übrig
                setCurrentSessionId(null);
                setCurrentSessionName(null);
                setCurrentAppState(initialAppState); // Zurück zum Default
                navigate('/', {replace: true}); // Zur Hauptseite ohne ID
            }
        }
        // Wenn eine andere Session gelöscht wurde, muss nichts am aktuellen Zustand geändert werden
    }, [allSessions, currentSessionId, navigate, loadSession, initialAppState]);


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
        initialAppState
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