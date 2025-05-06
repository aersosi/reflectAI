import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";

export function SessionNameInput() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const {
        currentSessionName,
        sessions,
        createSession,
        overwriteSession,
        initialAppState
    } = useSession();

    // Automatisch neue Session erstellen beim ersten Laden
    useEffect(() => {
        if (sessions.length === 0) {
            createSession("New Session", initialAppState);
        }
    }, [createSession, initialAppState, sessions.length]);

    // Focus handling beim Editieren
    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const startEditing = () => {
        setIsEditing(true);
        setInputValue(currentSessionName || "");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Kein Zeilenumbruch
            if (inputValue) overwriteSession("title", inputValue.trim());
            setIsEditing(false);
        } else if (e.key === "Escape") {
            setIsEditing(false);
        }
    };

    const handleCreateNewSession = () => {
        createSession("New Session", initialAppState);
    };

    return (
        <div className="flex gap-4 items-center grow h-[28px]">
            {isEditing ? (
                <Input
                    className="grow"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
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
                        size="xs"
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