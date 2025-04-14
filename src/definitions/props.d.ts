import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { AnthropicModel } from "@/definitions/session";

export type ModelInputProps = {
    data?: AnthropicModel[];
    placeholder?: string;
    labelTitle?: string;
    labelFor?: string;
};

export type PromptTextareaProps = {
    title: string;
    value: string;
    isUser?: boolean;
    isVariable?: boolean;
    placeholder: string;
    disabled?: boolean;
    onVariableChange: (value: string) => void;
    className?: string;
};

export type CardMessageProps = {
    className?: string,
    isUser?: boolean;
    title: string
    message: string
};

export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showTooltip?: boolean;
    hasMarks?: boolean;
    labelTitle?: string;
    labelValue?: number;
    labelFor?: string;
};

export type PromptVariablesSheetProps = {
    data: DataArray;
};

export type SheetWrapperProps = React.PropsWithChildren & {
    title: string;
    side?: "top" | "right" | "bottom" | "left" | undefined;
    icon?: "settings" | "braces" | "list";
    isWide?: boolean;
    saveButton?: boolean;
    disabled?: boolean;
}