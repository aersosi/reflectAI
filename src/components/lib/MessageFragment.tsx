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




function MessageFragment({onVariableChange, title, placeholder}: MessageFragmentProps) {
    const [message, setMessage] = useState('');

    const handleVariableChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textareaValue = e.target.value;
        const textareaId = e.target.id;
        setMessage(textareaValue);
        onVariableChange?.({ value: textareaValue, id: textareaId });
    };

    return (
        <Collapsible defaultOpen className="transition-colors border rounded-xl bg-card text-card-foreground shadow-sm
        [&:has(textarea:focus-visible)]:border-ring [&:has(textarea:focus-visible)]:ring-ring/50 [&:has(textarea:focus-visible)]:ring-[3px]
        [&:has(textarea:aria-invalid)]:ring-destructive/20 dark:[&:has(textarea:aria-invalid)]:ring-destructive/40 [&:has(textarea:border-destructive)]">
            <SidebarGroup>
                <SidebarGroupLabel asChild>
                    <CollapsibleTrigger>
                        <Label htmlFor={title}>{title}</Label>
                        <ChevronDown
                            className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"/>
                    </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent className="relative px-2 border-t-1">
                    <Textarea
                        id={title}
                        name={title}
                        value={message}
                        onChange={handleVariableChange}
                        placeholder={placeholder}
                        variant="no-focus"
                        className="absolute inset-0 whitespace-pre-wrap overflow-hidden break-words px-2 resize-none border-0 shadow-none"
                    />
                    <p className="pointer-events-none invisible whitespace-pre-wrap break-words pt-[9px] md:text-sm min-h-14">{message}</p>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
}

export default MessageFragment;

