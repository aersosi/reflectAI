import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { SystemVariables, Variable } from "@/definitions/variables";
import { Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export const PromptVariables = ({systemVariables}: {
    systemVariables: SystemVariables,
}) => {
    const {currentAppState, appendSessionVariable,deleteSessionVariable, overwriteSessionVariableText} = useSession();
    const currentSystemVars = currentAppState.systemVariables;

    const [systemValue, setSystemValue] = useState('');
    const updateSystemValue = (value: string) => setSystemValue(value);

    const [systemVariablesPersist, setSystemVariablesPersist] = useState<Variable[]>([]);


    const addSystemVariable = (variable: Variable, id: string) => {
        const idUsed = currentSystemVars.variables.find((variable) => variable.id === id);
        if (idUsed) {
            // todo: toast a message to user: "No variables with same name"
            console.error(`Variable with id ${id} already used in systemVariables.variables`);
            return
        }

        setSystemVariablesPersist((prev) => [...prev, variable]);
        appendSessionVariable("appState.systemVariables.variables", variable, id)
    };

    const saveSystemVariableValue = (value: string, id: string) => {
        console.log("id", id);
        console.log("value", value);
        overwriteSessionVariableText(id, value)
    }

    // load vars on start
    useEffect(() => {
        setSystemVariablesPersist(currentSystemVars.variables)
    }, [systemVariablesPersist]);

    const sysVarInPersist = (variableId: string) => systemVariablesPersist.some((value) => value.id === variableId);
    const sysVarInOrigin = (variableId: string) => systemVariables.variables.some((value) => value.id === variableId);

    const deleteVariable = (id: string) => {
        console.log("variable delete", id);
        deleteSessionVariable(id);
        setSystemVariablesPersist((prev) =>
            prev.filter((variable) => variable.id !== id)
        );
    };

    return (
        <>
            {systemVariables.variables.map((variable: Variable) => (
                !sysVarInPersist(variable.id) && (
                    <Button
                        key={variable.id}
                        size={"sm"}
                        onClick={() => addSystemVariable(variable, variable.id)}
                    >
                        Add: {variable.name}
                    </Button>
                )
            ))}

            {systemVariablesPersist.map((variable: Variable) => (
                <div className="relative" key={`${variable.id}`}>
                    <PromptTextarea
                        value={systemValue}
                        onChange={updateSystemValue}
                        onCommit={(value) => saveSystemVariableValue(value, variable.id)}
                        onDelete={() => setSystemValue("")}
                        isUser={false}
                        isVariable={true}
                        title={`${systemVariables.title.replace(" prompt", ":")} ${variable.name}`}
                        placeholder={variable.name}
                    />

                    {!sysVarInOrigin(variable.id) && (
                        <div
                            className="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-white/85 rounded-xl">
                            <p>No matching variable</p>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => deleteVariable(variable.id)}
                                    variant="ghostDestructive"
                                    size="xs"
                                >
                                    Delete
                                    <Trash2></Trash2>
                                </Button>
                                <Button
                                    onClick={() => deleteVariable(variable.id)}
                                    variant="ghost"
                                    size="xs"
                                >
                                    Ignore
                                    <Check></Check>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};
