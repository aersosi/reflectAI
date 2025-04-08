import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils.ts";

function ApiKey() {
    const [showApiKey, setShowApiKey] = useState(false);
    const toggleShowApiKey = () => {
        setShowApiKey(prev => !prev);
    };

    const inputType = showApiKey ? "text" : "password"
    const buttonColor = showApiKey && "border-primary"

    return (
            <div className="relative flex flex-col items-start gap-4 w-full">
                <Label htmlFor="ApiKey" className="pl-0.5 text-muted-foreground">
                    Antropic Api Key</Label>
                <Input type={inputType} id="ApiKey" placeholder="Antropic Api Key"/>
                <Button className={cn(buttonColor, "absolute right-1 bottom-1")} variant="outline"
                        size="iconSmall" onClick={toggleShowApiKey}>
                    {showApiKey ? <Eye className="text-primary"></Eye> : <EyeOff></EyeOff>}
                    <span className="sr-only">Toggle show/hide Antropic AI key</span>
                </Button>
            </div>

    );
}

export default ApiKey;

