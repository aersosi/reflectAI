import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/contexts/SessionContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ApiKeyInput({className}: { className?: string }) {
    const [showApiKey, setShowApiKey] = useState(false);
    const {currentAppState, saveSession, isSessionLoading} = useSession(); // Get context functions and state

    const toggleShowApiKey = () => {
        setShowApiKey(prev => !prev);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentAppState) return;
        const newValue = event.target.value;
        saveSession({
            settings: {
                ...currentAppState?.settings,
                apiKey: newValue,
            },
        });
    };

    const inputType = showApiKey ? "text" : "password"
    const buttonColor = showApiKey && "border-primary"

    const valueFromContext = currentAppState?.settings?.apiKey || "";

    return (
        <div className={cn("relative flex flex-col items-start gap-4 w-full", className)}>
            <Label htmlFor="ApiKey" className="pl-0.5 text-muted-foreground">
                Anthropic Api Key</Label>
            <p className="text-xs text-muted-foreground px-1">Note: Using at own risk</p>
            <Input
                type={inputType}
                id="ApiKey"
                placeholder="Anthropic Api Key"
                value={valueFromContext}
                onChange={handleChange}
                disabled={isSessionLoading || !currentAppState}
            />

            <Button
                className={cn(buttonColor, "absolute right-1 bottom-1")}
                variant="outline"
                size="iconSmall"
                onClick={toggleShowApiKey}
                disabled={isSessionLoading || !currentAppState}
            >
                {showApiKey ? <Eye className="text-primary"></Eye> : <EyeOff></EyeOff>}
                <span className="sr-only">Toggle show/hide Anthropic AI key</span>
            </Button>
        </div>

    );
}


