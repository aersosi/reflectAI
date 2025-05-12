import { PromptVariables, Variable } from '@/definitions/variables';
import { replaceAll } from '@/lib/utils';

export const buildVariablesMap = (variables: Variable[]): Record<string, string> => {
    return variables.reduce((acc, variable) => {
        acc[variable.title] = variable.text;
        return acc;
    }, {} as Record<string, string>);
};

const extractVariables = (str: string): Variable[] => {
    const matches = str.match(/\{\{\s*[^}]+\s*}}/g) || [];

    return matches.map((variable, index) => {
        const cleanVar = variable
            .replace(/^{{\s*|\s*}}$/g, '') // remove wrapping braces and surrounding spaces
            .replace(/\s+/g, '_') // replace inner spaces with underscores
            .trim();

        return {
            id: `${cleanVar}_${index}`,
            title: variable.trim(),
            text: '',
        };
    });
};

export const createPromptVariables = (id: string, title: string, text: string): PromptVariables => ({
    id,
    title,
    variables: extractVariables(text),
});

export const replaceVariables = (text: string, variablesMap: Record<string, string>): string => {
    if (Object.keys(variablesMap).length === 0) return text; // return just text if no variables used
    return replaceAll(text, variablesMap);
};