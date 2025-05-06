import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ApiKeyInput({className}: { className?: string }) {
    const {currentAppState, overwriteSession, isSessionLoading} = useSession();
    const [showApiKey, setShowApiKey] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Sync with context value on mount/context change
    useEffect(() => {
        currentAppState.settings?.apiKey && setInputValue(currentAppState.settings.apiKey);
    }, [currentAppState.settings?.apiKey]);

    const persistInput = () => {
        if (!currentAppState) return;
        if (inputValue !== currentAppState.settings?.apiKey) {
            overwriteSession("appState.settings.apiKey", inputValue);
        }
    };

    const toggleShowApiKey = () => {
        setShowApiKey(prev => !prev);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Kein Zeilenumbruch
            persistInput();
        }
    };

    const inputType = showApiKey ? "text" : "password";
    const buttonColor = showApiKey && "border-primary";

    return (
        <div className={cn("relative flex flex-col items-start gap-4 w-full", className)}>
            <Label htmlFor="ApiKey" className="pl-0.5 text-muted-foreground">
                Anthropic API Key
            </Label>
            <p className="text-xs text-muted-foreground px-1">
                Note: Using at own risk
            </p>

            {/*todo: apply this pattern (value, onChange, Keydown, Blur) to all inputs*/}
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
                {showApiKey ? <Eye className="text-primary"/> : <EyeOff/>}
                <span className="sr-only">Toggle show/hide Anthropic AI key</span>
            </Button>
        </div>
    );
}
