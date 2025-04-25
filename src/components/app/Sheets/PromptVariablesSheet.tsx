import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { VariablesHistory, VariableHistoryItem } from "@/definitions/variables";
import { useEffect, useState } from "react";

export const PromptVariablesSheet = ({systemVariables, userVariables}: {
    systemVariables: VariablesHistory,
    userVariables: VariablesHistory
}) => {
    const [systemVar, setSystemVar] = useState('');
    const [userVar, setUserVar] = useState('');
    const handleChangeSystem = (value: string) => setSystemVar(value);
    const handleChangeUser = (value: string) => setUserVar(value);

    useEffect(() => {
        console.log("systemVar", systemVar)
        console.log("userVar", userVar)
    },[systemVar, userVar])

    return (
        <SheetWrapper key="SessionVariables" title="Chat Variables" side="right" icon="braces"
                      isWide={true}
                      disabled={systemVariables.length === 0 && userVariables.length === 0}>

            {systemVariables.map((vars: VariableHistoryItem, index: number) => (
                vars.variables.map((singleVar: string) => (
                    <PromptTextarea
                        // value={systemValue}
                        onChange={handleChangeSystem}
                        onCommit={handleChangeSystem}
                        isUser={false}
                        isVariable={true}
                        key={`${singleVar}-${index}`}
                        title={`${vars.title.replace(" prompt", ":")} ${singleVar}`}
                        placeholder={singleVar}
                    />
                ))
            ))}


            {userVariables.map((vars: VariableHistoryItem, index: number) => (
                vars.variables.map((singleVar: string) => (
                    <PromptTextarea
                        // value={userValue}
                        onChange={handleChangeUser}
                        onCommit={handleChangeUser}
                        isUser={true}
                        isVariable={true}
                        key={`${singleVar}-${index}`}
                        title={`${vars.title.replace(" prompt", ":")} ${singleVar}`}
                        placeholder={singleVar}
                    />
                ))
            ))}


        </SheetWrapper>
    );
};
