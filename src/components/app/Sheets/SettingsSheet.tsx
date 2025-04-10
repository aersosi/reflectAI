import { SheetWrapper } from "@/components/lib/SheetWrapper.tsx";
import { ModelDropdown } from "@/components/app/MainSidebar/ModelDropdown.tsx";
import { SliderTooltip } from "@/components/lib/SliderTooltip.tsx";
import { ApiKeyInput } from "@/components/app/MainSidebar/ApiKeyInput.tsx";
import { useState } from "react";
import { useAnthropic } from "@/context/AnthropicContext.tsx";

export const SettingsSheet = () => {
    const [temperatureValue, setTemperatureValue] = useState([0]);
    const [maxTokensValue, setMaxTokensValue] = useState([0]);
    const {anthropicModels} = useAnthropic()

    // if (isLoadingModels) return <div>Loading Anthropic models...</div>;
    // if (modelsError) return <div>An error occurred fetching models: {modelsError.message}</div>;

    return (
        <SheetWrapper
            key="SheetWrapper"
            title="Session Settings"
            side="left"
            icon="settings"
            saveButton={true}
        >
            <div className="grid gap-12">
                {anthropicModels ?
                    <ModelDropdown
                        key="aiModel"
                        data={anthropicModels}
                        placeholder="Select a model"
                        labelFor="aiModel"
                        labelTitle="Model"

                    >
                    </ModelDropdown> : <p>Loading Anthropic Models ...</p>
                }
                <SliderTooltip
                    id="SliderTemperature"
                    max={1}
                    step={0.1}
                    hasMarks={true}
                    showTooltip={true}
                    labelFor="SliderTemperature"
                    labelTitle="Temperature"
                    labelValue={temperatureValue[0]}
                    onValueCommit={setTemperatureValue}
                />
                <SliderTooltip
                    id="SliderMaxTokens"
                    max={4096}
                    step={4}
                    showTooltip={true}
                    labelFor="SliderMaxTokens"
                    labelTitle="Max tokens"
                    labelValue={maxTokensValue[0]}
                    onValueCommit={setMaxTokensValue}
                />
            </div>
            <ApiKeyInput className="mt-auto"></ApiKeyInput>
        </SheetWrapper>
    );
};
