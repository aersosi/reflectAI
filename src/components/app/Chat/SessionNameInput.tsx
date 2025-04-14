import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";

export function SessionNameInput() {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        currentSessionName,
        sessions,
        createSession,
        saveSession,
        currentSession,
        initialSession
    } = useSession();

    // Automatisch neue Session erstellen beim ersten Laden
    useEffect(() => {
        if (sessions.length === 0) {
            createSession("New Session", initialSession);
        }
    }, [createSession, initialSession, sessions.length]);

    // Focus handling beim Editieren
    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const startEditing = () => {

        console.log("initialSession", initialSession.settings?.temperature)
        console.log("currentSession", currentSession)

        setTempName(currentSessionName || "");
        setIsEditing(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (tempName.trim()) saveSession(tempName.trim(), currentSession);
            setIsEditing(false);
        } else if (e.key === "Escape") {
            setIsEditing(false);
        }
    };

    const handleCreateNewSession = () => {
        createSession("New Session", initialSession);
    };

    return (
        <div className="flex gap-4 items-center grow h-[28px]">
            {isEditing ? (
                <Input
                    className="grow"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setIsEditing(false)}
                    ref={inputRef}
                    placeholder="Session Name"
                />
            ) : (
                <>
                    <h2
                        className="grow font-bold cursor-pointer"
                        onClick={startEditing}
                        title="Click to edit">
                        {currentSessionName || "New Session"}
                    </h2>
                    <Button
                        size="sm"
                        onClick={handleCreateNewSession}
                        variant="outlinePrimary"
                    >
                        New Session
                    </Button>
                </>
            )}
        </div>
    );
}