import { Input } from "@/components/ui/input.tsx";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";

export function SessionNameInput() {
    const [editSessionName, setEditSessionName] = useState(false);
    const [sessionNameValue, setSessionNameValue] = useState("New Session");
    const [originalValue, setOriginalValue] = useState(sessionNameValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Set focus on input
        if (editSessionName && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editSessionName]);

    function handleEditSessionNameClick() {
        setOriginalValue(sessionNameValue);
        setEditSessionName(true);
    }

    function handleEditSessionNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            setEditSessionName(false);
        } else if (e.key === "Escape") {
            setSessionNameValue(originalValue);
            setEditSessionName(false);
        }
    }

    const handleSessionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSessionNameValue(e.target.value);
    };

    const handleBlur = () => {
        if (!sessionNameValue.trim()) {
            setSessionNameValue(originalValue);
            setEditSessionName(false);
        }
    };

    return (
        <div className="flex gap-4 items-center grow h-[28px]">
            {editSessionName ? (
                <Input
                    className="grow"
                    type="text"
                    placeholder="Please enter session name"
                    value={sessionNameValue}
                    onChange={handleSessionNameChange}
                    onKeyDown={handleEditSessionNameKeyDown}
                    onBlur={handleBlur}
                    ref={inputRef}
                />
            ) : (
                <h2
                    className="grow font-bold cursor-pointer"
                    onDoubleClick={handleEditSessionNameClick}
                    title="Double-click to edit"
                >
                    {sessionNameValue || "Please enter session name"}
                </h2>
            )}
            <Button size="sm">New Session</Button>
        </div>
    );
}