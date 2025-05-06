import { useSession } from '@/contexts/SessionContext';
import { AnthropicResponse } from "@/definitions/api";
import { Message, SystemMessage, UserMessage } from '@/definitions/session';
import { nanoid } from 'nanoid';

export const useSessionActions = () => {
    const { overwriteSession, appendToMessagesHistory, currentAppState } = useSession();

    const updateHistorySystem = (value: string) => {
        const systemMessage: SystemMessage = {
            id: 'system_Prompt',
            text: value,
        };
        if (value !== currentAppState.systemPrompt.text) {
            overwriteSession('appState.systemPrompt', systemMessage);
        }
    };

    const updateHistoryUser = (value: string) => {
        const userMessage: UserMessage = {
            id: 'user_prompt',
            role: 'user',
            content: [{ type: 'text', text: value }],
        };
        if (value !== currentAppState.userPrompt.content[0].text) {
            overwriteSession('appState.userPrompt', userMessage);
        }
        return userMessage;
    };

    const updateHistoryContinue = (value: string) => {
        const continueMessage: Message = {
            id: `continue_${nanoid(6)}`,
            role: 'user',
            content: [{ type: 'text', text: value }],
        };
        if (value.length > 0) {
            appendToMessagesHistory(continueMessage);
        }
        return continueMessage;
    };

    const mapToCurrentMessagesHistory = (source: AnthropicResponse) => {
        return {
            id: `assistant_${nanoid(6)}`,
            role: "assistant",
            content: source.content.map((block) => ({
                type: "text",
                text: block.text
            }))
        };
    };


    return { updateHistorySystem, updateHistoryUser, updateHistoryContinue, mapToCurrentMessagesHistory };
};