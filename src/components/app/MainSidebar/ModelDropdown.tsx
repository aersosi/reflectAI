import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/SessionContext";
import { ModelInputProps } from "@/definitions/props";
import { useEffect, useState } from "react";
import { AnthropicModel } from "@/definitions/api";

export function ModelDropdown({data, placeholder, labelTitle, labelFor}: ModelInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const {currentSession, saveSession, isSessionLoading} = useSession(); // Get context functions and state

    const handleEscapeKeydown = () => {
        setIsOpen(false);
    }

    const handleValue = (): string => {
        if (!currentSession?.settings) {
            return data?.[0]?.id || '';
        }
        return currentSession.settings.model || data?.[0]?.id || '';
    };

    const handleChange = (value: string) => {
        if (!currentSession || !value) return;
        saveSession({
            settings: {
                ...currentSession?.settings,
                model: value,
            },
        });
    }

    return (
        <div className="flex flex-col items-start gap-4 w-full">
            {labelFor && labelTitle && (
                <Label htmlFor={labelFor} className="pl-0.5 text-muted-foreground">
                    {labelTitle}
                </Label>
            )}
            <Select open={isOpen}
                    onOpenChange={setIsOpen}
                    value={handleValue()}
                    onValueChange={handleChange}
                    disabled={isSessionLoading || !currentSession}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent onEscapeKeyDown={handleEscapeKeydown}>
                    <SelectGroup>
                        {(data as AnthropicModel[] | null)?.map((model) => (
                            <SelectItem
                                className="hover:bg-primary/10 cursor-pointer"
                                key={model.id}
                                value={model.id}
                            >
                                {model.id}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}