import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useAnthropic } from "@/contexts/AnthropicContext";
import { useEffect, useState } from "react";

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

import { Play, ExternalLink } from "lucide-react";

export function Sidebars() {
    const {currentAppState, currentMessagesHistory,} = useSession();
    const {apiKeyError} = useAnthropic();
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
    const [isAlert, setIsAlert] = useState(false);

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
        if (apiKeyError) setIsAlert(true);

        runPrompt(
            userValue, continueValue,
            currentSystemVariables.variables, currentUserVariables.variables,
            currentSystemPromptText, currentUserPromptText
        );
    };

    return (
        <div className={`sidebars bg-sidebar flex flex-col w-full min-w-39 ${sidebarsWidth}`}>
            <AlertDialog open={isAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>No API key provided</AlertDialogTitle>
                        <AlertDialogDescription className="flex flex-col gap-4 py-2 items-center sm:items-start leading-relaxed">
                            <p>
                                Enter Api Key into <span className="font-medium text-foreground pl-1">reflectAI / settings / Anthropic Api Key</span>
                            </p>
                            <p>
                                Or create <span className="font-medium text-foreground">.env</span> file in project root with:
                                <span className="font-medium text-foreground wrap-anywhere sm:break-normal"> VITE_ANTHROPIC_API_KEY=your_API_key_here</span>
                            </p>
                            <p className="sm:flex w-full items-center gap-2">
                                <span>Lern how to get an Api Key:</span>
                                <a className="flex items-center w-fit mx-auto sm:mx-0" target="_blank"
                                   href="https://docs.anthropic.com/en/api/admin-api/apikeys/get-api-key">
                                    <Button variant="link">
                                        Anthropic Docs
                                        <ExternalLink></ExternalLink>
                                    </Button>
                                </a>
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="w-full max-w-48 mx-auto sm:w-fit sm:mx-0" onClick={() => setIsAlert(false)}>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div
                className="sidebarsHeader relative flex items-center justify-between gap-4 pl-4 pr-4 sm:pr-15 py-2 border-b border-r flex-wrap">
                <h1 className="font-bold transition-colors text-primary hover:text-purple-500 py-0.5">reflectAI</h1>
                <div
                    className="flex items-center gap-x-4 gap-y-2 text-sm font-medium flex-wrap">
                    <p className="flex gap-2 flex-wrap"><span
                        className="text-muted-foreground font-normal">Model: </span>{currentAppState.settings?.model}
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
                        onClearValue={() => setSystemValue("")}
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
                        onClearValue={() => setSystemValue("")}
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

