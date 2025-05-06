import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { PromptVariables, Variable } from "@/definitions/variables";
import { useEffect, useState } from "react";

export const PromptVariablesComp = ({variables, isUser = true}: {
    variables: PromptVariables,
    isUser?: boolean
}) => {
    const {currentAppState, appendSessionVariable, deleteSessionVariable, overwriteSessionVariableText} = useSession();
    const currentVariables = isUser ? currentAppState.userVariables : currentAppState.systemVariables;

    const [value, setValue] = useState<{ [key: string]: string }>({});
    const [variablesPersist, setVariablesPersist] = useState<Variable[]>([]);

    const addVariable = (variable: Variable, id: string) => {
        const idUsed = currentVariables.variables.find((variable) => variable.id === id);
        if (idUsed) {
            // todo: toast a message to user: "No variables with same name"
            console.error(`Variable with id ${id} already used in variables.variables`);
            return
        }

        const variablePath = isUser ? "appState.userVariables.variables" : "appState.systemVariables.variables";

        setVariablesPersist((prev) => [...prev, variable]);
        appendSessionVariable(variablePath, variable, id)
    };

    const updateVariableValue = (value: string, id: string) => {
        setValue((prev) => ({...prev, [id]: value}))
    }

    const saveVariableValue = (value: string, id: string) => {
        overwriteSessionVariableText(id, value, isUser)
    }

    const clearVariableValue = (id: string) => {
        overwriteSessionVariableText(id, "", isUser)
        setValue((prev) => ({...prev, [id]: ""}))
    }

    const deleteVariable = (id: string) => {
        deleteSessionVariable(id, isUser);
        setVariablesPersist((prev) =>
            prev.filter((variable) => variable.id !== id)
        );
    };

    // load vars on start
    useEffect(() => {
        setVariablesPersist(currentVariables.variables)
        const newValues = currentVariables.variables.reduce((acc, variable) => {
            acc[variable.id] = variable.text || '';
            return acc;
        }, {} as { [key: string]: string });
        setValue(newValues);

        console.log(variablesPersist)
    }, [variablesPersist]);

    const variableInPersist = (variableId: string) => variablesPersist.some((variable) => variable.id === variableId);
    const variableInOrigin = (variableId: string) => variables.variables.some((variable) => variable.id === variableId);
    const hasDuplicateTitles = () => variablesPersist.some((variable, index, arr) => arr.findIndex(x => x.title === variable.title) !== index);

    return (
        <>
            {hasDuplicateTitles() && (
                <p className="text-sm text-destructive text-center">
                    Please don't use duplicate variables
                </p>
            )}

            {variables.variables.map((variable: Variable) => (
                !variableInPersist(variable.id) && (
                    <Button
                        variant={`${isUser ? "secondary" : "default"}`}
                        key={variable.id}
                        size={"sm"}
                        onClick={() => addVariable(variable, variable.id)}
                    >
                        Add: {variable.title}
                    </Button>
                )
            ))}

            {variablesPersist.map((variable: Variable) => (
                <div className="flex flex-col gap-2 relative" key={`${variable.id}`}>
                    <PromptTextarea
                        value={value[variable.id] || ''}
                        onChange={(value) => updateVariableValue(value, variable.id)}
                        onCommit={(value) => saveVariableValue(value, variable.id)}
                        onDelete={() => deleteVariable(variable.id)}
                        onClearValue={() => clearVariableValue(variable.id)}
                        isUser={isUser}
                        isVariable={true}
                        title={`${variables.title.replace(" prompt", ":")} ${variable.title}`}
                        placeholder={variable.title}
                    />

                    {!variableInOrigin(variable.id) && (
                        <p className="absolute -bottom-2.5 w-full text-center pointer-events-none">
                            <span className="text-sm bg-red-400 text-white px-2 pt-0.5 pb-0.75 rounded-md">
                                {`No variable ${variable.title} in ${isUser ? "User" : "System"} Prompt`}
                            </span>
                        </p>
                    )}
                </div>
            ))}
        </>
    );
};
