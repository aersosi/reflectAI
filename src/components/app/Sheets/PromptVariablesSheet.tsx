import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { DataArray, DataItem } from "@/definitions/variables";

export const PromptVariablesSheet = ({ variables }: {variables: DataArray}) => {
    return (
        <SheetWrapper key="SessionVariables" title="Chat Variables" side="right" icon="braces"
                      isWide={true}
                      saveButton={true} disabled={variables.length === 0}>
            {variables.map((vars: DataItem, index: number) => (
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
