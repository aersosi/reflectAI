import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Definiere die Varianten mit cva
const textareaVariants = cva(
    "border-input placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base md:text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-visible:ring-[3px]",
                "no-focus": "",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, // Behalte Standard-Textarea-Attribute bei
        VariantProps<typeof textareaVariants> {
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({className, variant, ...props}, ref) => { // Füge 'variant' zu den Props hinzu
        return (
            <textarea
                data-slot="textarea"
                className={cn(textareaVariants({variant, className}))}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea" // Setze den Anzeigenamen für Debugging etc.

export { Textarea, textareaVariants } // Exportiere die Komponente und optional die Varianten
