import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ModelInputProps } from "@/definitions/props";
import { useState } from "react";
import { AnthropicModel } from "@/definitions/api";

export function ModelDropdown({data, placeholder, labelTitle, labelFor}: ModelInputProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleEscapeKeydown = () => {
        setIsOpen(false);
    }
    const firstItem = data? data[0].id : null;

    return (
        <div className="flex flex-col items-start gap-4 w-full">
            {labelFor && labelTitle && (
                <Label htmlFor={labelFor} className="pl-0.5 text-muted-foreground">
                    {labelTitle}
                </Label>
            )}
            <Select open={isOpen} onOpenChange={setIsOpen} defaultValue={firstItem}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent onEscapeKeyDown={handleEscapeKeydown} >
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