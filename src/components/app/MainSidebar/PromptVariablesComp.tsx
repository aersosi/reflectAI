import { AlertClose } from "@/components/lib/AlertClose";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { PromptVariables, Variable } from "@/definitions/variables";
import { Check, Trash2 } from "lucide-react";
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

    const deleteVariableValue = (id: string) => {
        overwriteSessionVariableText(id, "", isUser)
        setValue((prev) => ({...prev, [id]: ""}))
    }

    // load vars on start
    useEffect(() => {
        setVariablesPersist(currentVariables.variables)
        const newValues = currentVariables.variables.reduce((acc, variable) => {
            acc[variable.id] = variable.text || '';
            return acc;
        }, {} as { [key: string]: string });
        setValue(newValues);
    }, [variablesPersist]);

    const variableInPersist = (variableId: string) => variablesPersist.some((value) => value.id === variableId);
    const variableInOrigin = (variableId: string) => variables.variables.some((value) => value.id === variableId);

    const deleteVariable = (id: string) => {
        deleteSessionVariable(id, isUser);
        setVariablesPersist((prev) =>
            prev.filter((variable) => variable.id !== id)
        );
    };

    // Du bist {{ animalName }}
    // Mach ein {{ doStuff }}

    const [alertHidden, setAlertHidden] = useState<{ [key: string]: boolean }>({});
    const hideAlert = (id: string) => {
        setAlertHidden((prev) => ({...prev, [id]: true}));
    };

    return (
        <>
            {variables.variables.map((variable: Variable) => (
                !variableInPersist(variable.id) && (
                    <Button
                        key={variable.id}
                        size={"sm"}
                        onClick={() => addVariable(variable, variable.id)}
                    >
                        Add: {variable.name}
                    </Button>
                )
            ))}

            {variablesPersist.map((variable: Variable) => (
                <div className="flex flex-col gap-4" key={`${variable.id}`}>
                    <PromptTextarea
                        value={value[variable.id] || ''}
                        onChange={(value) => updateVariableValue(value, variable.id)}
                        onCommit={(value) => saveVariableValue(value, variable.id)}
                        onDelete={() => deleteVariableValue(variable.id)}
                        isUser={isUser}
                        isVariable={true}
                        title={`${variables.title.replace(" prompt", ":")} ${variable.name}`}
                        placeholder={variable.name}
                    />

                    {!variableInOrigin(variable.id) && (
                        <AlertClose
                            title={`No matching variable ${variable.name} in ${isUser ? "User" : "System"} Prompt`}
                            destructive={true} close={alertHidden[variable.id]} key={variable.id}>
                            <div className="flex gap-2 justify-end w-full">
                                <Button
                                    onClick={() => hideAlert(variable.id)}
                                    variant="ghost"
                                    size="xs"
                                >
                                    Ignore
                                    <Check></Check>
                                </Button>
                                <Button
                                    onClick={() => deleteVariable(variable.id)}
                                    variant="ghost"
                                    size="xs"
                                    className="-mr-3"
                                >
                                    Delete
                                    <Trash2></Trash2>
                                </Button>
                            </div>
                        </AlertClose>
                    )}
                </div>
            ))}
        </>
    );
};
