import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { ChevronDown, Trash2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { PromptTextareaProps } from "@/definitions/props";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

export function PromptTextarea({
                                   value,
                                   onChange,
                                   onCommit,
                                   onDelete,
                                   onClearValue,
                                   className,
                                   isUser,
                                   isDestructive,
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
        // safe on shift+enter
        if (e.key === "Enter" && e.shiftKey) {
            committedValueRef.current = internalValue;
            onCommit?.(internalValue);
        } else if (e.key === "Escape") {
            const previous = committedValueRef.current;
            setInternalValue(previous);
            onChange?.(previous);
        }
    };

    const handleChange = (val: string) => {
        setInternalValue(val);
        onChange?.(val);
    };

    const handleDelete = () => {
        committedValueRef.current = internalValue;
        onDelete?.(internalValue);
    };

    const handleClearValue = () => {
        committedValueRef.current = internalValue;
        onClearValue?.(internalValue);
    };

    const handleBlur = () => {
        committedValueRef.current = internalValue;
        onCommit?.(internalValue);
    };

    const collapsibleClasses = cn(
        "transition border rounded-xl bg-card text-card-foreground shadow-sm",
        "[&:has(textarea:focus-visible)]:border-primary/50 [&:has(textarea:focus-visible)]:ring-ring/50 [&:has(textarea:focus-visible)]:ring-[3px]",
        "[&:has(textarea:aria-invalid)]:ring-destructive/20 dark:[&:has(textarea:aria-invalid)]:ring-destructive/40 [&:has(textarea:aria-invalid)]:border-destructive"
    );

    const purpleRing = "[&:has(textarea:focus-visible)]:ring-purple-500/50 [&:has(textarea:focus-visible)]:border-purple-500/50";
    const destructiveRing = "[&:has(textarea:focus-visible)]:ring-destructive/50 [&:has(textarea:focus-visible)]:border-destructive/50";

    const colors = () => {
        if (isDestructive) return `${destructiveRing} [&_label]:text-destructive`;
        if (isVariable) {
            return isUser
                ? `${purpleRing} [&_label]:text-purple-500`
                : "[&_label]:text-primary";
        }
        return "";
    };

    const userRingColorTrigger = () => {
        if (isDestructive) return "focus-visible:ring-destructive/90 focus-visible:border-destructive/90";
        if (isUser) return "focus-visible:ring-purple-500/90 focus-visible:border-purple-500/90";
        return "";
    };

    return (
        <Collapsible defaultOpen
                     className={cn(collapsibleClasses, colors(), className)}>
            <SidebarGroup>
                <div className="flex justify-between gap-2 items-center">
                    <SidebarGroupLabel asChild>
                        <CollapsibleTrigger className={cn("group grow", userRingColorTrigger())}>
                            <Label htmlFor={title}>{title}</Label>
                            <ChevronDown
                                className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180"/>
                        </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    {onDelete &&
                        <Button
                            onClick={handleDelete}
                            variant="ghostDestructive"
                            size="iconSmall"
                        >
                            <Trash2/>
                        </Button>
                    }
                </div>
                <CollapsibleContent className="relative px-2">
                    {onClearValue && internalValue.length > 0 &&
                        <Button
                            className="absolute cursor-pointer z-50 top-2 right-0.5 opacity-10 hover:opacity-100"
                            onClick={handleClearValue}
                            variant="ghostDestructive"
                            size="iconSmall">
                            <X/>
                        </Button>
                    }

                    <hr className="mt-[2px]"/>

                    <Textarea
                        id={title}
                        title={title}
                        value={internalValue}
                        wrap={"hard"}
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
