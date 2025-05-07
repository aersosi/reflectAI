import { useAnthropic } from '@/contexts/AnthropicContext';
import { useSession } from '@/contexts/SessionContext';
import { useSessionActions } from "@/hooks/sidebars/useSessionActions";
import { buildVariablesMap, replaceVariables } from '@/services/variableService';
import { Variable } from '@/definitions/variables';

export const useRunPrompt = () => {
    const { callAnthropic, loadingMessages, apiKeyError } = useAnthropic();
    const { currentMessagesHistory, appendToMessagesHistory } = useSession();
    const { updateHistoryUser, updateHistoryContinue } = useSessionActions();

    const runPrompt = async (
        userValue: string,
        continueValue: string,
        systemVariables: Variable[],
        userVariables: Variable[],
        currentSystemPromptText: string,
        currentUserPromptText: string
    ) => {

        if (apiKeyError) {
            console.warn("No API key provided. Please set the environment variable or enter one in the settings.");
            return;
        }

        const updatedUserMessage = updateHistoryUser(userValue);
        const updatedContinueMessage = updateHistoryContinue(continueValue);

        const systemVariablesMap = buildVariablesMap(systemVariables);
        const userVariablesMap = buildVariablesMap(userVariables);

        // Replace variables in user prompt
        updatedUserMessage.content[0].text = replaceVariables(currentUserPromptText, userVariablesMap);
        // Replace variables in the system prompt
        const replacedSystemPrompt = replaceVariables(currentSystemPromptText, systemVariablesMap);

        const updatedHistory = [
            ...currentMessagesHistory,
            ...(updatedUserMessage ? [updatedUserMessage] : []),
            ...(updatedContinueMessage ? [updatedContinueMessage] : []),
        ];

        if (updatedHistory.length === 0) {
            console.warn("No messages to send to Anthropic");
            return;
        }

        const response = await callAnthropic(updatedHistory, replacedSystemPrompt);
        appendToMessagesHistory(response);
    };

    return { runPrompt, loadingMessages };
};