import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { PromptTextareaProps } from "@/definitions/props";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

export function PromptTextarea({
                                   value,
                                   onChange,
                                   onCommit,
                                   className,
                                   isUser,
                                   isVariable,
                                   title,
                                   placeholder,
                                   disabled,
                               }: PromptTextareaProps) {
    const [internalValue, setInternalValue] = useState(value);
    const committedValueRef = useRef(value);

    // Bei external control: synchronisiere state mit prop
    useEffect(() => {
            setInternalValue(value!);
            committedValueRef.current = value!;
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!internalValue.trim()) return; // return on empty textarea

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            committedValueRef.current = internalValue;
            onCommit?.(internalValue);
        } else if (e.key === "Escape") {
            e.preventDefault();
            const previous = committedValueRef.current;
            setInternalValue(previous);
            onChange?.(previous);
        }
    };

    const handleChange = (val: string) => {
        setInternalValue(val);
        onChange?.(val);
    };

    const handleBlur = () => {
        if (!internalValue.trim()) return;
        if (internalValue === committedValueRef.current) return;
        committedValueRef.current = internalValue;
        onCommit?.(internalValue);
    };

    const collapsibleClasses = cn(
        "transition border rounded-xl bg-card text-card-foreground shadow-sm",
        "[&:has(textarea:focus-visible)]:border-primary/50 [&:has(textarea:focus-visible)]:ring-ring/50 [&:has(textarea:focus-visible)]:ring-[3px]",
        "[&:has(textarea:aria-invalid)]:ring-destructive/20 dark:[&:has(textarea:aria-invalid)]:ring-destructive/40 [&:has(textarea:aria-invalid)]:border-destructive"
    );

    const purpleRing = "[&:has(textarea:focus-visible)]:ring-purple-500/50 [&:has(textarea:focus-visible)]:border-purple-500/50";
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
                        value={internalValue}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        variant="no-focus"
                        className="absolute inset-0 whitespace-pre-wrap overflow-hidden break-words px-2 resize-none border-0 shadow-none"
                    />
                    <p className="pointer-events-none invisible whitespace-pre-wrap break-words pt-[5px] md:text-sm min-h-14">
                        {internalValue || ' '}
                    </p>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
}
