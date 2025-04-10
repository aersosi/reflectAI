import { SheetWrapper } from "@/components/lib/SheetWrapper.tsx";
import { ModelDropdown } from "@/components/app/MainSidebar/ModelDropdown.tsx";
import { SliderTooltip } from "@/components/lib/SliderTooltip.tsx";
import { ApiKeyInput } from "@/components/app/MainSidebar/ApiKeyInput.tsx";
import { useSession } from "@/context/SessionContext.tsx";
import { useState } from "react";

export const SettingsSheet = () => {
    const [temperatureValue, setTemperatureValue] = useState([0]);
    const [maxTokensValue, setMaxTokensValue] = useState([0]);
    const {currentAppState} = useSession();
    const isAnthropicModels = currentAppState?.settings?.anthropicModels;

    return (
        <SheetWrapper
            key="SheetWrapper"
            title="Session Settings"
            side="left"
            icon="settings"
            saveButton={true}
        >
            <div className="grid gap-12">
                {isAnthropicModels ?
                    <ModelDropdown
                        key="aiModel"
                        data={isAnthropicModels}
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
