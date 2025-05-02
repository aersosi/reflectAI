export type Variable = {
    id: string;
    name: string;
    text: string;
};

export type SystemVariables = {
    id: "system_variables";
    title: string;
    variables: Variable[];
};

export type UserVariables = {
    id: "user_variables";
    title: string;
    variables: Variable[];
};

