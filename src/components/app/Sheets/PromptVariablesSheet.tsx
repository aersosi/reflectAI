import { PromptTextarea } from "@/components/lib/PromptTextarea.tsx";
import { SheetWrapper } from "@/components/lib/SheetWrapper.tsx";
import { PromptVariablesSheetProps } from "@/definitions/props";
import { DataItem } from "@/definitions/api";

export const PromptVariablesSheet = ({ data }: PromptVariablesSheetProps) => {
    return (
        <SheetWrapper key="SessionVariables" title="Chat Variables" side="right" icon="braces"
                      isWide={true}
                      saveButton={true} disabled={data.length === 0}>
            {data.map((vars: DataItem, index: number) => (
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
