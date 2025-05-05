import { PromptVariablesComp } from "@/components/app/MainSidebar/PromptVariablesComp";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { SidebarWrapper } from "@/components/app/sidebars/SidebarWrapper";
import { ContinueTextarea } from "@/components/lib/ContinueTextarea";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { Button } from "@/components/ui/button";
import { useAnthropic } from "@/contexts/AnthropicContext";
import { useSession } from "@/contexts/SessionContext";
import { Message, SystemMessage, UserMessage } from "@/definitions/session";
import { PromptVariables, Variable } from "@/definitions/variables";
import { replaceAll } from "@/lib/utils";
import { Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function Sidebars() {
    const {loadingMessages, callAnthropic} = useAnthropic();
    const {
        currentAppState,
        currentMessagesHistory,
        overwriteSession,
        appendToMessagesHistory,
    } = useSession();

    const [systemValue, setSystemValue] = useState('');
    const [userValue, setUserValue] = useState('');
    const [continueValue, setContinueValue] = useState('');

    const currentSystemPrompt = currentAppState.systemPrompt
    const currentUserPrompt = currentAppState.userPrompt
    const currentSystemPromptText = currentSystemPrompt.text;
    const currentUserPromptText = currentUserPrompt.content[0].text;
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
            id: `continue_${crypto.randomUUID()}`,
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



    const buildVariablesMap = (variables: Variable[]): Record<string, string> => {
        return variables.reduce((acc, variable) => {
            acc[variable.name] = variable.text;
            return acc;
        }, {} as Record<string, string>);
    };

    const handleRun = async () => {
        const updatedUserMessage = updateHistoryUser(userValue);
        const updatedContinueMessage = updateHistoryContinue(continueValue);

        const systemVariablesMap = buildVariablesMap(currentSystemVariables.variables);
        const userVariablesMap = buildVariablesMap(currentUserVariables.variables);

        // Replace variables in user prompt
        updatedUserMessage.content[0].text = replaceAll(currentUserPromptText, userVariablesMap);
        // Replace variables in the system prompt
        const replacedSystemPrompt = replaceAll(currentSystemPromptText, systemVariablesMap);

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


    const extractVariables = (str: string): { id: string; name: string; text: string }[] => {
        const matches = str.match(/\{\{\s*[^}]+\s*}}/g) || [];

        return matches.map((variable, index) => {
            const cleanVar = variable
                .replace(/^{{\s*|\s*}}$/g, "")  // remove wrapping braces and surrounding spaces
                .replace(/\s+/g, "_")           // replace inner spaces with underscores
                .trim();

            return {
                id: `${cleanVar}_${index}`,
                name: variable.trim(),
                text: ""
            };
        });
    };

    const systemVariables: PromptVariables = {
        id: "system_variables",
        title: "System prompt",
        variables: extractVariables(systemValue)
    };
    const userVariables: PromptVariables = {
        id: "user_variables",
        title: "User prompt",
        variables: extractVariables(userValue)
    };

    const isRunButtonDisabled = loadingMessages || !userValue.trim();
    const containsAssistantId = currentMessagesHistory.some(item => item.id && item.id.startsWith("assistant"));

    const [sidebar_1_expanded, setSidebar_1_Expanded] = useState(true);
    const [sidebar_2_expanded, setSidebar_2_Expanded] = useState(true);
    const [sidebar_3_expanded, setSidebar_3_Expanded] = useState(true);
    const [sidebarsWidth, setSidebarsWidth] = useState("");

    const calculateSidebarsWidth = useCallback(() => {
        const width = (sidebar_1_expanded ? 1 : 0) +
            (sidebar_2_expanded ? 1 : 0) +
            (sidebar_3_expanded ? 1 : 0);
        const widthMap = ["max-w-1/12", "max-w-5/12", "max-w-7/12", "max-w-9/12"];
        return widthMap[width];
    }, [sidebar_1_expanded, sidebar_2_expanded, sidebar_3_expanded]);

    useEffect(() => {
        const newWidth = calculateSidebarsWidth();
        setSidebarsWidth(newWidth);
    }, [calculateSidebarsWidth, sidebar_1_expanded, sidebar_2_expanded, sidebar_3_expanded]);

    return (
        <div className={`sidebars bg-sidebar flex flex-col w-full min-w-39 ${sidebarsWidth}`}>
            <div className="sidebarsHeader flex items-center justify-between gap-4 px-4 py-2 border-b border-r">
                <h1 className="font-bold transition-colors text-primary hover:text-purple-500">reflectAI</h1>
                <div className="flex gap-6">
                    <SettingsSheet/>
                </div>
            </div>
            <div className="sidebarsContent flex border-r grow pt-4 px-2 overflow-hidden">
                <SidebarWrapper
                    isExpanded={sidebar_1_expanded}
                    setIsExpanded={setSidebar_1_Expanded}
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
                        isExpanded={sidebar_2_expanded}
                        setIsExpanded={setSidebar_2_Expanded}
                        title="Variables"
                        className="sidebar_2"
                    >
                        <PromptVariablesComp variables={systemVariables} isUser={false} />
                        <PromptVariablesComp variables={userVariables} isUser={true}/>
                    </SidebarWrapper>
                )}
                {containsAssistantId &&
                    <SidebarWrapper
                        isExpanded={sidebar_3_expanded}
                        setIsExpanded={setSidebar_3_Expanded}
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

