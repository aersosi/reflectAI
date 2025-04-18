import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { ModelDropdown } from "@/components/app/MainSidebar/ModelDropdown";
import { SliderTooltip } from "@/components/lib/SliderTooltip";
import { ApiKeyInput } from "@/components/app/MainSidebar/ApiKeyInput";
import { useAnthropic } from "@/contexts/AnthropicContext";
import { useSession } from "@/contexts/SessionContext";

export const SettingsSheet = () => {
    const {anthropicModels} = useAnthropic()
    const {currentAppState, updateSession} = useSession()

    const handleTemperatureChange = (val: number[]) => {
        updateSession("appState.settings.temperature", val[0]);
    }
    const handleMaxTokensChange = (val: number[]) => {
        updateSession("appState.settings.maxTokens", val[0]);
    }

    const temperatureValue = currentAppState?.settings?.temperature ? [currentAppState.settings.temperature] : undefined;
    const maxTokensValue = currentAppState?.settings?.maxTokens ? [currentAppState.settings.maxTokens] : undefined;

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
                    defaultValue={temperatureValue}
                    max={currentAppState?.settings?.temperatureMax}
                    step={currentAppState?.settings?.temperatureSteps}
                    onValueCommit={handleTemperatureChange}
                    showTooltip={true}
                    labelFor="SliderTemperature"
                    labelTitle="Temperature"
                    hasMarks={true}
                />
                <SliderTooltip
                    id="SliderMaxTokens"
                    defaultValue={maxTokensValue}
                    max={currentAppState?.settings?.maxTokensMax}
                    step={currentAppState?.settings?.maxTokensSteps}
                    onValueCommit={handleMaxTokensChange}
                    showTooltip={true}
                    labelFor="SliderMaxTokens"
                    labelTitle="Max tokens"
                />
            </div>
            <ApiKeyInput className="mt-auto"></ApiKeyInput>
        </SheetWrapper>
    );
};
