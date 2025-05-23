import { ComponentPropsWithoutRef, Dispatch, PropsWithChildren, ReactNode, SetStateAction } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { AnthropicModel } from "@/definitions/session";

export type ModelInputProps = {
    data?: AnthropicModel[];
    placeholder?: string;
    labelTitle?: string;
    labelFor?: string;
};

export type PromptTextareaProps = {
    title: string | ReactNode;
    value: string;
    isUser?: boolean;
    isDestructive?: boolean;
    isVariable?: boolean;
    placeholder: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
    onCommit?: (value: string) => void;
    onDelete?: (e: PointerEvent<HTMLButtonElement>) => void;
    onClearValue?: (e: PointerEvent<HTMLButtonElement>) => void;
    className?: string;
};

export type CardMessageProps = {
    className?: string,
    id?: string,
    isUser?: boolean;
    title: string
    message: string
};

export type SliderProps = ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showTooltip?: boolean;
    hasMarks?: boolean;
    labelTitle?: string;
    labelValue?: number;
    labelFor?: string;
};

export type SheetWrapperProps = PropsWithChildren & {
    title: string;
    description?: string,
    headerChildren?: JSX.Element,
    open?: boolean;
    side?: "top" | "right" | "bottom" | "left" | undefined;
    icon?: "settings" | "braces" | "list";
    isWide?: boolean;
    disabled?: boolean;
}

export type SidebarWrapperProps = {
    isExpanded: boolean;
    setIsExpanded: Dispatch<SetStateAction<boolean>>;
    title: string;
    children: ReactNode;
    className?: string;
};

export type TouchTargetProps = {
    children: ReactNode;
    onClick?: () => void;
};
