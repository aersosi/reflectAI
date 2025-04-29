import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { Button } from "@/components/ui/button";
import { VariableGroup, Variable } from "@/definitions/variables";
import { Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export const PromptVariables = ({systemVariables, userVariables}: {
    systemVariables: VariableGroup,
    userVariables: VariableGroup
}) => {
    const [systemVar, setSystemVar] = useState('');
    const [userVar, setUserVar] = useState('');

    const handleChangeSystem = (value: string) => setSystemVar(value);
    const handleChangeUser = (value: string) => setUserVar(value);
    const [systemVarTemp, setSystemVarTemp] = useState<Variable[]>([]);
    const [userVarTemp, setUserVarTemp] = useState<Variable[]>([]);

    useEffect(() => {
        console.log("systemVar", systemVar)
        console.log("userVar", userVar)


        console.log("systemVariables", systemVariables)
        console.log("userVariables", userVariables)
    }, [systemVar, userVar])


    const handleAddSystemVariable = (sysVar: Variable) => {
        console.log("sysVar", sysVar);
        setSystemVarTemp((prev) => [...prev, sysVar]);
    };

    const handleAddUserVariable = (userVar: Variable) => {
        console.log("userVar", userVar);
        setUserVarTemp((prev) => [...prev, userVar]);
    };

    const sysVarInTemp = (variableId: string) => systemVarTemp.some((value) => value.id === variableId);
    const sysVarInOrigin = (variableId: string) => systemVariables.variables.some((value) => value.id === variableId);
    const deleteVariable = (variableId: string) => {
        setSystemVarTemp((prev) =>
            prev.filter((variable) => variable.id !== variableId)
        );
    };
    return (
        <>
            {systemVariables.variables.map((variable: Variable) => (
                !sysVarInTemp(variable.id) && (
                    <Button
                        key={variable.id}
                        size={"sm"}
                        onClick={() => handleAddSystemVariable(variable)}
                    >
                        Add: {variable.name}
                    </Button>
                )
            ))}
            {systemVarTemp.map((variable: Variable) => (
                <div className="relative">
                    <PromptTextarea
                        value={systemVar}
                        onChange={handleChangeSystem}
                        onCommit={handleChangeSystem}
                        onDelete={() => setSystemVar("")}
                        isUser={false}
                        isVariable={true}
                        key={`${variable.id}`}
                        title={`${systemVariables.title.replace(" prompt", ":")} ${variable.name}`}
                        placeholder={variable.name}
                    />
                    {!sysVarInOrigin(variable.id) && (
                        <div key={variable.id}
                             className="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-white/85 rounded-xl">
                            <p>No matching variable</p>
                            <div className="flex gap-2">
                                <Button onClick={() => deleteVariable(variable.id)} variant="ghostDestructive"
                                        size="xs">
                                    Delete
                                    <Trash2></Trash2>
                                </Button>
                                <Button onClick={() => deleteVariable(variable.id)} variant="ghost" size="xs">
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
