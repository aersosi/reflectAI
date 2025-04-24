export type VariableHistoryItem = {
    title: string;
    variables: string[];
};

export type VariablesHistory = VariableHistoryItem[];


export type Variable = {
    id: string;
    name: string;
    text: string;
};

export type VariableGroup = {
    parentId: string;
    title: string;
    variables: Variable;
};

export type VariablesHistory2 = {
    systemVariables: VariableGroup;
    userVariables: VariableGroup;
};

// export const variablesHistory2: VariablesHistory2 = {
//     systemVariables: {
//         parentId: "system_123456",
//         title: "System prompt",
//         variables: {
//             id: "systemVar_123456",
//             name: "{{ text1 }}",
//             text: "Lorem ipsum dolor sit"
//         }
//     },
//     userVariables: {
//         parentId: "user_123456",
//         title: "User prompt",
//         variables: {
//             id: "userVar_123456",
//             name: "{{ text2 }}",
//             text: "Lorem ipsum dolor sit"
//         }
//     },
// }

