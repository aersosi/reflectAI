export type Post = {
    body: string;
    id: number;
    title: string;
    userId: number;
};

export type MessageFragmentProps = {
    onVariableChange?: (params: {
        value: string;
        id: string;
    }) => void;
    title: string;
    placeholder: string;
};

export type CardMessageProps = {
    className?: string,
    title: string
    message: string
};