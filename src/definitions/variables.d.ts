export type Variable = {
    id: string;
    title: string;
    text: string;
};

export type PromptVariables = {
    id: "system_variables" | "user_variables";
    title: string;
    variables: Variable[];
};

