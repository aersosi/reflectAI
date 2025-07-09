// ApiKeyInput.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export function ApiKeyInput({ className }: { className?: string }) {
    const { currentAppState, overwriteSession, isSessionLoading } = useSession();
    const queryClient = useQueryClient();
    const [showApiKey, setShowApiKey] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Sync with context value on mount/context change
    useEffect(() => {
        if (currentAppState.settings?.apiKey) {
            setInputValue(currentAppState.settings.apiKey);
        } else {
            setInputValue("");
        }
    }, [currentAppState.settings?.apiKey]);

    const persistInput = () => {
        if (inputValue !== currentAppState.settings?.apiKey) {
            overwriteSession("appState.settings.apiKey", inputValue);
            // Invalidiere die Abfrage sofort, um Modelle neu zu laden
            queryClient.invalidateQueries({ queryKey: ["anthropicModels", inputValue] });
        }
    };

    const toggleShowApiKey = () => {
        setShowApiKey((prev) => !prev);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            persistInput();
        }
    };

    const handleDelete = () => {
        setInputValue("");
        overwriteSession("appState.settings.apiKey", "");
        // Invalidiere die Abfrage, um Modelle zurückzusetzen
        queryClient.invalidateQueries({ queryKey: ["anthropicModels"] });
    };

    const inputType = showApiKey ? "text" : "password";
    const buttonColor = showApiKey ? "border-primary" : "";

    return (
        <div className={cn("relative flex flex-col items-start gap-4 w-full", className)}>
            <Label htmlFor="ApiKey" className="flex gap-4 justify-between w-full pl-0.5">
                <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Anthropic API Key</span>
                    <span className="text-destructive text-xs">Note: Using at own risk!</span>
                </div>
                <div className="w-8 h-8">
                    {inputValue.length > 0 && (
                        <Button onClick={handleDelete} variant="ghostDestructive" size="iconSmall">
                            <Trash2 />
                        </Button>
                    )}
                </div>
            </Label>
            <Input
                type={inputType}
                id="ApiKey"
                placeholder="Anthropic API Key"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={persistInput}
                disabled={isSessionLoading || !currentAppState}
            />
            <Button
                className={cn(buttonColor, "absolute right-1 bottom-1")}
                variant="outline"
                size="iconSmall"
                onClick={toggleShowApiKey}
                disabled={isSessionLoading || !currentAppState}
            >
                {showApiKey ? <Eye className="text-primary" /> : <EyeOff />}
                <span className="sr-only">Toggle show/hide Anthropic AI key</span>
            </Button>
        </div>
    );
}