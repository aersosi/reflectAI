import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { VariableGroup } from "@/definitions/variables";
import { useEffect, useState } from "react";

export const PromptVariables = ({systemVariables, userVariables}: {
    systemVariables: VariableGroup,
    userVariables: VariableGroup
}) => {
    const [systemVar, setSystemVar] = useState('');
    const [userVar, setUserVar] = useState('');
    const handleChangeSystem = (value: string) => setSystemVar(value);
    const handleChangeUser = (value: string) => setUserVar(value);

    useEffect(() => {
        console.log("systemVar", systemVar)
        console.log("userVar", userVar)
    }, [systemVar, userVar])

    return (
        <>
            {systemVariables.variables.map((variable) => (
                <PromptTextarea
                    value={systemVar}
                    onChange={handleChangeSystem}
                    onCommit={handleChangeSystem}
                    isUser={false}
                    isVariable={true}
                    key={`${variable.id}`}
                    title={`${systemVariables.title.replace("prompt", "variable")}: ${variable.name}`}
                    placeholder={variable.name}
                />
            ))}
            {userVariables.variables.map((variable) => (
                <PromptTextarea
                    value={systemVar}
                    onChange={handleChangeUser}
                    onCommit={handleChangeUser}
                    isUser={true}
                    isVariable={true}
                    key={`${variable.id}`}
                    title={`${userVariables.title.replace("prompt", "variable")}: ${variable.name}`}
                    placeholder={variable.name}
                />
            ))}
        </>
    );
};
