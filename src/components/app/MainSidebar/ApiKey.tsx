import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export function ApiKey({className}: {className?: string}) {
    const [showApiKey, setShowApiKey] = useState(false);
    const toggleShowApiKey = () => {
        setShowApiKey(prev => !prev);
    };

    const inputType = showApiKey ? "text" : "password"
    const buttonColor = showApiKey && "border-primary"

    return (
        <div className={cn("relative flex flex-col items-start gap-4 w-full", className)}>
            <Label htmlFor="ApiKey" className="pl-0.5 text-muted-foreground">
                Anthropic Api Key</Label>
            <Input type={inputType} id="ApiKey" placeholder="Anthropic Api Key"/>
            <Button className={cn(buttonColor, "absolute right-1 bottom-1")} variant="outline"
                    size="iconSmall" onClick={toggleShowApiKey}>
                {showApiKey ? <Eye className="text-primary"></Eye> : <EyeOff></EyeOff>}
                <span className="sr-only">Toggle show/hide Anthropic AI key</span>
            </Button>
        </div>

    );
}


