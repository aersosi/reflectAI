import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { ModelDropdown } from "@/components/app/MainSidebar/ModelDropdown";
import { SliderTooltip } from "@/components/lib/SliderTooltip";
import { ApiKeyInput } from "@/components/app/MainSidebar/ApiKeyInput";
import { useAnthropic } from "@/contexts/AnthropicContext";
import { useSession } from "@/contexts/SessionContext";

export const SettingsSheet = () => {
    const {anthropicModels} = useAnthropic()
    const {currentSession} = useSession()

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
                    max={currentSession?.settings?.temperature}
                    step={currentSession?.settings?.temperatureSteps}
                    showTooltip={true}
                    labelFor="SliderTemperature"
                    labelTitle="Temperature"
                    hasMarks={true}
                />
                <SliderTooltip
                    id="SliderMaxTokens"
                    max={currentSession?.settings?.maxTokens}
                    step={currentSession?.settings?.maxTokensSteps}
                    showTooltip={true}
                    labelFor="SliderMaxTokens"
                    labelTitle="Max tokens"
                />
            </div>
            <ApiKeyInput className="mt-auto"></ApiKeyInput>
        </SheetWrapper>
    );
};
