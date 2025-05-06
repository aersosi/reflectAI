import { PromptVariablesComp } from "@/components/app/MainSidebar/PromptVariablesComp";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { SidebarWrapper } from "@/components/app/sidebars/SidebarWrapper";
import { ContinueTextarea } from "@/components/lib/ContinueTextarea";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { Button } from "@/components/ui/button";
import { useAnthropic } from "@/contexts/AnthropicContext";
import { useSession } from "@/contexts/SessionContext";
import { Message, SystemMessage, UserMessage } from "@/definitions/session";
import { usePromptValues } from "@/hooks/usePromptValues";
import { useSidebarLayout } from "@/hooks/useSidebarLayout";
import { createPromptVariables, buildVariablesMap, replaceVariables } from "@/services/variableService";
import { Play } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect } from "react";

export function Sidebars() {
    const {loadingMessages, callAnthropic} = useAnthropic();
    const {
        currentAppState,
        currentMessagesHistory,
        overwriteSession,
        appendToMessagesHistory,
    } = useSession();

    const {
        sidebar1Expanded, setSidebar1Expanded,
        sidebar2Expanded, setSidebar2Expanded,
        sidebar3Expanded, setSidebar3Expanded,
        sidebarsWidth,
    } = useSidebarLayout();

    const {systemValue, setSystemValue, userValue, setUserValue, continueValue, setContinueValue} = usePromptValues();

    const currentSystemPromptText = currentAppState.systemPrompt.text;
    const currentUserPromptText = currentAppState.userPrompt.content[0].text;
    const currentSystemVariables = currentAppState.systemVariables
    const currentUserVariables = currentAppState.userVariables

    const updateHistorySystem = (value: string) => {
        const systemMessage: SystemMessage = {
            id: "system_Prompt",
            text: value,
        };
        if (value !== currentUserPromptText) overwriteSession("appState.systemPrompt", systemMessage);
    };

    const updateHistoryUser = (value: string) => {
        const userMessage: UserMessage = {
            id: "user_prompt",
            role: "user",
            content: [{type: "text", text: value}],
        };
        if (value !== currentUserPromptText) overwriteSession("appState.userPrompt", userMessage);
        return userMessage;
    };

    const updateHistoryContinue = (value: string) => {
        const continueMessage: Message = {
            id: `continue_${nanoid(6)}`,
            role: "user",
            content: [{type: "text", text: value}],
        };
        if (value.length > 0) appendToMessagesHistory(continueMessage);
        return continueMessage
    };

    // load Values on Start
    useEffect(() => {
        setSystemValue(currentSystemPromptText);
        setUserValue(currentUserPromptText);
    }, [currentSystemPromptText, currentUserPromptText]);

    const handleRun = async () => {
        const updatedUserMessage = updateHistoryUser(userValue);
        const updatedContinueMessage = updateHistoryContinue(continueValue);

        const systemVariablesMap = buildVariablesMap(currentSystemVariables.variables);
        const userVariablesMap = buildVariablesMap(currentUserVariables.variables);

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

    const systemVariables = createPromptVariables('system_variables', 'System prompt', systemValue);
    const userVariables = createPromptVariables('user_variables', 'User prompt', userValue);

    const isRunButtonDisabled = loadingMessages || !userValue.trim();
    const containsAssistantId = currentMessagesHistory.some(item => item.id && item.id.startsWith("assistant"));

    return (
        <div className={`sidebars bg-sidebar flex flex-col w-full min-w-39 ${sidebarsWidth}`}>
            <div className="sidebarsHeader flex items-center justify-between gap-4 px-4 py-2 border-b border-r">
                <h1 className="font-bold transition-colors text-primary hover:text-purple-500">reflectAI</h1>
                <div className="flex gap-6">
                    <SettingsSheet/>
                </div>
            </div>
            <div className="sidebarsContent flex border-r grow pt-4 px-2 overflow-auto">
                <SidebarWrapper
                    isExpanded={sidebar1Expanded}
                    setIsExpanded={setSidebar1Expanded}
                    title="Prompts"
                    className="sidebar_1"
                >
                    <PromptTextarea
                        isVariable={true}
                        value={systemValue}
                        onChange={setSystemValue}
                        onCommit={updateHistorySystem}
                        title="System prompt"
                        placeholder="Enter system prompt"
                        disabled={loadingMessages}
                    />
                    <PromptTextarea
                        isVariable={true}
                        isUser={true}
                        value={userValue}
                        onChange={setUserValue}
                        onCommit={updateHistoryUser}
                        title="User prompt"
                        placeholder="Enter user prompt"
                        disabled={loadingMessages}
                    />
                </SidebarWrapper>
                {(systemVariables.variables.length > 0 || userVariables.variables.length > 0) && (
                    <SidebarWrapper
                        isExpanded={sidebar2Expanded}
                        setIsExpanded={setSidebar2Expanded}
                        title="Variables"
                        className="sidebar_2"
                    >
                        <PromptVariablesComp variables={systemVariables} isUser={false}/>
                        <PromptVariablesComp variables={userVariables} isUser={true}/>
                    </SidebarWrapper>
                )}
                {containsAssistantId &&
                    <SidebarWrapper
                        isExpanded={sidebar3Expanded}
                        setIsExpanded={setSidebar3Expanded}
                        title="Followup"
                        className="sidebar_3"
                    >
                        <div className="grow relative">
                            <ContinueTextarea
                                isUser={true}
                                value={continueValue}
                                onChange={setContinueValue}
                                title="User prompt"
                                placeholder="Type follow up question ..."
                                disabled={loadingMessages}
                            />
                        </div>
                    </SidebarWrapper>
                }
            </div>
            <div className="sidebarsFooter px-4 py-2 border-t border-r flex">
                <Button
                    className="w-full"
                    onClick={handleRun}
                    disabled={isRunButtonDisabled}
                    size="sm"
                    variant="outlinePrimary"
                ><Play/> Run
                </Button>
            </div>
        </div>
    )
}

