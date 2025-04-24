import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { VariablesHistory, VariableHistoryItem } from "@/definitions/variables";

export const PromptVariablesSheet = ({ variables }: {variables: VariablesHistory}) => {
    return (
        <SheetWrapper key="SessionVariables" title="Chat Variables" side="right" icon="braces"
                      isWide={true}
                      saveButton={true} disabled={variables.length === 0}>
            {variables.map((vars: VariableHistoryItem, index: number) => (
                vars.variables.map((singleVar: string) => (
                <PromptTextarea
                        isUser={vars.title.toLowerCase().includes("user")}
                        isVariable={true}
                        key={`${singleVar}-${index}`}
                        title={`${vars.title.replace("prompt", "variable")}: ${singleVar}`}
                        placeholder={singleVar}
                    />
                ))
            ))}
        </SheetWrapper>
    );
};
