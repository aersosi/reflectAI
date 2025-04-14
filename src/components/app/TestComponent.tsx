import { useAnthropic } from "@/contexts/AnthropicContext";
import { AnthropicModel } from "@/definitions/api";

export const TestComponent = () => {
    const {anthropicModels, modelsError, isLoadingModels} = useAnthropic()

    if (isLoadingModels) return <div>Loading Anthropic models...</div>;
    if (modelsError) return <div>An error occurred fetching models: {modelsError.message}</div>;

    return (
        <>
            <ul>
                {(anthropicModels as AnthropicModel[] | null)?.map((model) => (
                    <li key={model.id}>
                        {model.display_name} || ({model.id}) || {new Date(model.created_at).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        </>
    );
};