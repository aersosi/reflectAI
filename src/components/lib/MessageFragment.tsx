import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx"
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar.tsx";
import { ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useState } from "react";
import { MessageFragmentProps } from "@/definitions/types";
import { Label } from "@/components/ui/label.tsx";
import { cn } from "@/lib/utils.ts";

export function MessageFragment({
                                    className,
                                    onVariableChange,
                                    isUser,
                                    isVariable,
                                    title,
                                    placeholder
                                }: MessageFragmentProps) {
    const [message, setMessage] = useState('');

    const handleVariableChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textareaValue = e.target.value;
        const textareaId = e.target.id;
        setMessage(textareaValue);
        onVariableChange?.({value: textareaValue, id: textareaId});
    };

    const collapsibleClasses = "transition border rounded-xl bg-card text-card-foreground shadow-sm\n" +
        "[&:has(textarea:focus-visible)]:border-primary/50 [&:has(textarea:focus-visible)]:ring-ring/50 [&:has(textarea:focus-visible)]:ring-[3px]\n" +
        "[&:has(textarea:aria-invalid)]:ring-destructive/20 dark:[&:has(textarea:aria-invalid)]:ring-destructive/40 [&:has(textarea:aria-invalid)]:border-destructive"

    const purpleRing = "[&:has(textarea:focus-visible)]:ring-purple-500/50 [&:has(textarea:focus-visible)]:border-purple-500/50"
    const systemColors = !isUser && isVariable && "[&_label]:text-primary bg-primary/5 border-primary/50 [&_hr]:border-primary/50";
    const userColors = isUser && isVariable && cn(purpleRing, "[&_label]:text-purple-500 bg-purple-50 border-purple-500/50 [&_hr]:border-purple-500/50");
    const userRingColor = isUser && purpleRing;

    return (
        <Collapsible defaultOpen className={cn(collapsibleClasses, systemColors, userColors, userRingColor, className)}>
            <SidebarGroup>
                <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="group">
                        <Label htmlFor={title}>{title}</Label>
                        <ChevronDown
                            className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180"/>
                    </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent className="relative px-2">
                    <hr className="mt-[2px]"/>
                    <Textarea
                        id={title}
                        name={title}
                        value={message}
                        onChange={handleVariableChange}
                        placeholder={placeholder}
                        variant="no-focus"
                        className="absolute inset-0 whitespace-pre-wrap overflow-hidden break-words px-2 resize-none border-0 shadow-none"
                    />
                    <p className="pointer-events-none invisible whitespace-pre-wrap break-words pt-[5px] md:text-sm min-h-14">{message}</p>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
}

