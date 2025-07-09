import { Textarea } from "@/components/ui/textarea";
import { PromptTextareaProps } from "@/definitions/props";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

export function ContinueTextarea({
                                     value,
                                     onChange,
                                     onCommit,
                                     title,
                                     placeholder,
                                     disabled,
                                 }: PromptTextareaProps) {
    const [internalValue, setInternalValue] = useState(value);
    const committedValueRef = useRef(value);

    // Aktualisiere bei externem Wertwechsel
    useEffect(() => {
        setInternalValue(value);
        committedValueRef.current = value;
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
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

    const handleBlur = () => {
        if (!internalValue.trim()) return; // return on empty textarea
        committedValueRef.current = internalValue;
        onCommit?.(internalValue);
    };


    return (
        <Textarea
            id={title as string}
            title={title as string}
            value={internalValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            variant="no-focus"
            className="absolute inset-0 resize-none"
        />
    );
}
