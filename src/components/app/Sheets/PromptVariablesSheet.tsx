import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { VariableGroup } from "@/definitions/variables";
import { useEffect, useState } from "react";

export const PromptVariablesSheet = ({systemVariables, userVariables}: {
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
        <SheetWrapper key="SessionVariables"
                      title="Chat Variables"
                      side="right"
                      icon="braces"
                      isWide={true}
                      disabled={systemVariables.variables.length === 0 && userVariables.variables.length === 0}
        >
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
        </SheetWrapper>
    );
};
