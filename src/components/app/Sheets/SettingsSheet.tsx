import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { ModelDropdown } from "@/components/app/MainSidebar/ModelDropdown";
import { SliderTooltip } from "@/components/lib/SliderTooltip";
import { ApiKeyInput } from "@/components/app/MainSidebar/ApiKeyInput";
import { useAnthropic } from "@/contexts/AnthropicContext";
import { useSession } from "@/contexts/SessionContext";

export const SettingsSheet = () => {
    const {anthropicModels} = useAnthropic()
    const {currentSession, saveSession} = useSession()

    const handleTemperatureChange = (val: number[]) => {
        saveSession({
            settings: {...currentSession?.settings, temperature: val[0]},
        });
    }
    const handleMaxTokensChange = (val: number[]) => {
        saveSession({
            settings: {...currentSession?.settings, maxTokens: val[0]},
        });
    }

    const temperatureValue = currentSession?.settings?.temperature ? [currentSession.settings.temperature] : undefined;
    const maxTokensValue = currentSession?.settings?.maxTokens ? [currentSession.settings.maxTokens] : undefined;

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
                    max={currentSession?.settings?.temperatureMax}
                    step={currentSession?.settings?.temperatureSteps}
                    onValueCommit={handleTemperatureChange}
                    showTooltip={true}
                    labelFor="SliderTemperature"
                    labelTitle="Temperature"
                    hasMarks={true}
                />
                <SliderTooltip
                    id="SliderMaxTokens"
                    defaultValue={maxTokensValue}
                    max={currentSession?.settings?.maxTokensMax}
                    step={currentSession?.settings?.maxTokensSteps}
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
