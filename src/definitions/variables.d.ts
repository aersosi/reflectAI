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

// export const variablesHistory2: VariablesHistory2 = {
//     systemVariables: {
//         id: "system_123456",
//         title: "System prompt",
//         variables: {
//             id: "systemVar_123456",
//             name: "{{ text1 }}",
//             text: "Lorem ipsum dolor sit"
//         }
//     },
//     userVariables: {
//         id: "user_123456",
//         title: "User prompt",
//         variables: {
//             id: "userVar_123456",
//             name: "{{ text2 }}",
//             text: "Lorem ipsum dolor sit"
//         }
//     },
// }

