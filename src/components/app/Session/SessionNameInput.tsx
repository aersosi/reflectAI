import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";

export function SessionNameInput() {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        currentSessionName,
        sessions,
        createSession,
        saveCurrentSession,
        currentAppState,
        defaultInitialState
    } = useSession();

    // Automatisch neue Session erstellen beim ersten Laden
    useEffect(() => {
        if (sessions.length === 0) {
            createSession("New Session", defaultInitialState);
        }
    }, [createSession, defaultInitialState, sessions.length]);

    // Focus handling beim Editieren
    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const startEditing = () => {
        setTempName(currentSessionName || "");
        setIsEditing(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            confirmEdit();
        } else if (e.key === "Escape") {
            cancelEdit();
        }
    };

    const confirmEdit = () => {
        if (tempName.trim()) {
            saveCurrentSession(tempName.trim(), currentAppState);
        }
        setIsEditing(false);
    };

    const cancelEdit = () => {
        setIsEditing(false);
    };

    const handleCreateNewSession = () => {
        createSession("New Session", defaultInitialState);
    };

    return (
        <div className="flex gap-4 items-center grow h-[28px]">
            {isEditing ? (
                <Input
                    className="grow"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={confirmEdit}
                    ref={inputRef}
                    placeholder="Session name"
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