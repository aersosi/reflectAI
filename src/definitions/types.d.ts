export type Post = {
    body: string;
    id: number;
    title: string;
    userId: number;
};

export type MessageFragmentProps = {
    isUser?: boolean;
    isVariable?: boolean;
    title: string;
    placeholder: string;
    onVariableChange?: (params: {
        value: string;
        id: string;
    }) => void;
    className?: string;
};

export type CardMessageProps = {
    className?: string,
    isUser?: boolean;
    title: string
    message: string
};

export type SessionVariablesData = Array<{
    title: string;
    variables: string[];
}>;