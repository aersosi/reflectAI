import { PromptVariables } from "@/components/app/Sheets/PromptVariables";
import { SidebarWrapper } from "@/components/app/sidebars/SidebarWrapper";
import { ContinueTextarea } from "@/components/lib/ContinueTextarea";
import { useSession } from "@/contexts/SessionContext";
import { SystemPrompt } from "@/definitions/session";
import { VariableGroup } from "@/definitions/variables";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { AnthropicResponse } from "@/definitions/api";
import { useAnthropic } from "@/contexts/AnthropicContext";

export function Sidebars() {
    const {loadingMessages, callAnthropic} = useAnthropic();
    const {
        currentAppState,
        currentMessagesHistory,
        overwriteSession,
        appendToMessagesHistory,
        appendToVariablesHistory
    } = useSession();

    const [systemValue, setSystemValue] = useState('');
    const [userValue, setUserValue] = useState('');
    const [continueValue, setContinueValue] = useState('');

    const currentSystemPrompt = currentAppState.systemPrompt.text;

    const extractVariables = (str: string, idPrefix: string): { id: string; name: string; text: string }[] => {
        const matches = str.match(/\{\{\s*[^}]+\s*}}/g) || [];

        return matches.map((variable, index) => {
            const cleanVar = variable.replace(/^{{\s*|\s*}}$/g, "").trim();

            return {
                id: `${idPrefix}_${cleanVar}_${index}`,
                name: variable.trim(),
                text: ""
            };
        });
    };

    const systemVariables: VariableGroup = {
        id: "system_variables",
        title: "System prompt",
        variables: extractVariables(systemValue, `systemVar`)
    };
    const userVariables: VariableGroup = {
        id: "user_variables",
        title: "User prompt",
        variables: extractVariables(userValue, `userVar`)
    };

    useEffect(() => {
        overwriteSession("appState.variablesHistory.systemVariables", systemVariables);
        overwriteSession("appState.variablesHistory.userVariables", userVariables);
    }, [systemValue, userValue]);

    const handleChangeSystem = (value: string) => setSystemValue(value);
    const handleChangeUser = (value: string) => setUserValue(value);
    const handleChangeContinue = (value: string) => setContinueValue(value);

    const updateHistorySystem = (value: string) => {
        if (value === currentSystemPrompt) return; // value unchanged -> don't add to messagesHistory

        const newSystemPrompt: SystemPrompt = {
            id: "system_prompt",
            text: value,
        };

        overwriteSession("appState.systemPrompt", newSystemPrompt);
    };

    const updateHistory = (value: string, id: string) => {
        if (value.length === 0) return;

        const userMessage: AnthropicResponse = {
            id: id,
            type: "message",
            role: "user",
            content: [{type: "text", text: value}],
        };

        appendToMessagesHistory(userMessage);
        return userMessage
    };

    const handleRunContinue = async () => {
        const updatedHistoryUser = updateHistory(userValue, `user_prompt`);
        const updatedHistoryContinue = updateHistory(continueValue, `continue_${crypto.randomUUID()}`);

        const updatedHistory = [];
        updatedHistory.push(...currentMessagesHistory);
        if (updatedHistoryUser) updatedHistory.push(updatedHistoryUser);
        if (updatedHistoryContinue) updatedHistory.push(updatedHistoryContinue);

        const anthropicReturn = await callAnthropic(updatedHistory, currentSystemPrompt);
        appendToMessagesHistory(anthropicReturn);
    };

    const isRunButtonDisabled = loadingMessages || !userValue.trim();
    const isContinueRunDisabled = loadingMessages || (!userValue.trim() && !continueValue.trim());

    const isUserPrompt = currentMessagesHistory.find(msg => msg.id === "user_prompt");
    const containsAssistantId = currentMessagesHistory.some(item => item.id && item.id.startsWith("assistant"));

    // load Values on Start
    useEffect(() => {
        setSystemValue(currentSystemPrompt);
        if (isUserPrompt) {
            const userText = isUserPrompt.content?.[0]?.text;
            if (userText) setUserValue(userText);
        }
    }, [currentSystemPrompt, isUserPrompt, currentMessagesHistory]);

    const [sidebar_1_expanded, setSidebar_1_Expanded] = useState(true);
    const [sidebar_2_expanded, setSidebar_2_Expanded] = useState(false);
    const [sidebar_3_expanded, setSidebar_3_Expanded] = useState(false);
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
                        onChange={handleChangeSystem}
                        onCommit={updateHistorySystem}
                        title="System prompt"
                        placeholder="Enter system prompt"
                        disabled={loadingMessages}
                    />
                    <PromptTextarea
                        isVariable={true}
                        isUser={true}
                        value={userValue}
                        onChange={handleChangeUser}
                        onCommit={(value) => updateHistory(value, `user_prompt`)}
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
                        <PromptVariables systemVariables={systemVariables} userVariables={userVariables}/>
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
                                onChange={handleChangeContinue}
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
                    onClick={handleRunContinue}
                    disabled={isContinueRunDisabled}
                    size="sm" variant="outlinePrimary"
                >
                    <Play/> Run
                </Button>
            </div>
        </div>
    )
}

