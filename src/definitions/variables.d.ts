export type Variable = {
    id: string;
    name: string;
    text: string;
};

export type VariableGroup = {
    id: "system_variables" | "user_variables";
    title: string;
    variables: Variable[];
};

export type VariablesHistory = {
    systemVariables: VariableGroup;
    userVariables: VariableGroup;
};

