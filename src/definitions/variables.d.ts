export type Variable = {
    id: string;
    name: string;
    text: string;
};

export type PromptVariables = {
    id: "system_variables" | "user_variables";
    title: string;
    variables: Variable[];
};

