import { useEffect } from "react";

import { PromptVariablesComp } from "@/components/app/sidebars/PromptVariablesComp";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { SidebarWrapper } from "@/components/app/sidebars/SidebarWrapper";
import { ContinueTextarea } from "@/components/lib/ContinueTextarea";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { Button } from "@/components/ui/button";

import { useSession } from "@/contexts/SessionContext";
import { createPromptVariables } from "@/services/variableService";

import { usePromptValues } from "@/hooks/sidebars/usePromptValues";
import { useRunPrompt } from "@/hooks/sidebars/useRunPrompt";
import { useSessionActions } from "@/hooks/sidebars/useSessionActions";
import { useSidebarLayout } from "@/hooks/sidebars/useSidebarLayout";

import { Play } from "lucide-react";

export function Sidebars() {
    const {currentAppState, currentMessagesHistory,} = useSession();
    const {
        sidebar1Expanded, setSidebar1Expanded,
        sidebar2Expanded, setSidebar2Expanded,
        sidebar3Expanded, setSidebar3Expanded,
        sidebarsWidth,
    } = useSidebarLayout();
    const {
        systemValue, setSystemValue,
        userValue, setUserValue,
        continueValue, setContinueValue
    } = usePromptValues();
    const {updateHistorySystem, updateHistoryUser} = useSessionActions();
    const {runPrompt, loadingMessages} = useRunPrompt();

    const currentSystemPromptText = currentAppState.systemPrompt.text;
    const currentUserPromptText = currentAppState.userPrompt.content[0].text;
    const currentSystemVariables = currentAppState.systemVariables
    const currentUserVariables = currentAppState.userVariables

    const systemVariables = createPromptVariables('system_variables', 'System prompt', systemValue);
    const userVariables = createPromptVariables('user_variables', 'User prompt', userValue);

    // load Values on Start
    useEffect(() => {
        setSystemValue(currentSystemPromptText);
        setUserValue(currentUserPromptText);
    }, [currentSystemPromptText, currentUserPromptText]);


    // reset sidebar width when sidebars closed
    useEffect(() => {
        setSidebar2Expanded(false)
        setSidebar3Expanded(false)
    }, [systemVariables.variables.length, userVariables.variables.length]);

    const isRunButtonDisabled = loadingMessages || !userValue.trim();
    const containsAssistantId = currentMessagesHistory.some(item => item.id && item.id.startsWith("assistant"));

    const handleRun = () => {
        runPrompt(
            userValue, continueValue,
            currentSystemVariables.variables, currentUserVariables.variables,
            currentSystemPromptText, currentUserPromptText
        );
    };

    return (
        <div className={`sidebars bg-sidebar flex flex-col w-full min-w-39 ${sidebarsWidth}`}>
            <div className="sidebarsHeader relative flex items-center justify-between gap-4 pl-4 pr-4 sm:pr-15 py-2 border-b border-r flex-wrap">
                <h1 className="font-bold transition-colors text-primary hover:text-purple-500 py-0.5">reflectAI</h1>
                <div
                    className="flex items-center gap-x-4 gap-y-2 text-sm font-medium flex-wrap">
                    <p className="flex gap-2 flex-wrap"><span className="text-muted-foreground font-normal">Model: </span>{currentAppState.settings?.model}
                    </p>
                    <p className="flex gap-2 flex-wrap"><span
                        className="text-muted-foreground font-normal">Temperature: </span>{currentAppState.settings?.temperature}
                    </p>
                    <p className="flex gap-2 flex-wrap"><span
                        className="text-muted-foreground font-normal">Max Tokens: </span>{currentAppState.settings?.maxTokens}
                    </p>
                </div>
                <span className="absolute top-2 right-4">
                    <SettingsSheet/>
                </span>
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

