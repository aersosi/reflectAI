import { PromptVariablesSheet } from "@/components/app/Sheets/PromptVariablesSheet";
import { ContinueTextarea } from "@/components/lib/ContinueTextarea";
import { defaultAppState } from "@/config/initialSession";
import { useSession } from "@/contexts/SessionContext";
import { VariablesHistory, VariablesHistory2 } from "@/definitions/variables";
import { useEffect, useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, Play } from "lucide-react";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { AnthropicResponse } from "@/definitions/api";
import { useAnthropic } from "@/contexts/AnthropicContext";

export function MainSidebar() {
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

    const currentSystemPrompt = currentAppState.systemPrompt;
    const [textareaExpanded, setTextareaExpanded] = useState(false);

    const extractVariables = (str: string): string[] => {
        return str.match(/\{\{\s*([^}]+)\s*}}/g) || [];
    }

    const systemUserArr: VariablesHistory = [];

    const systemVars = extractVariables(systemValue);
    if (systemVars.length > 0) systemUserArr.push({title: "System prompt", variables: systemVars});
    const userVars = extractVariables(userValue);
    if (userVars.length > 0) systemUserArr.push({title: "User prompt", variables: userVars});


    useEffect(() => {
        // console.log(systemUserArr);
        // console.log(extractVariables(systemValue));
        // console.log(extractVariables(userValue));
    }, [systemValue, userValue]);

    const handleChangeSystem = (value: string) => setSystemValue(value);
    const handleChangeUser = (value: string) => setUserValue(value);
    const handleChangeContinue = (value: string) => setContinueValue(value);

    const updateHistorySystem = (value: string) => {
        if (value === currentSystemPrompt) return; // value unchanged -> don't add to messagesHistory
        overwriteSession("appState.systemPrompt", value);
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

    const toggleTextareaExpanded = () => {
        setTextareaExpanded(prev => !prev);
    };

    const isRunButtonDisabled = loadingMessages || !userValue.trim();
    const isContinueRunDisabled = loadingMessages || (!userValue.trim() && !continueValue.trim());

    const isUserPrompt = currentMessagesHistory.find(msg => msg.id === "user_prompt");
    const containsAssistantId = currentMessagesHistory.some(item => item.id && item.id.startsWith("assistant"));

    // load Values on Start
    useEffect(() => {
        setSystemValue(currentSystemPrompt || "");
        if (isUserPrompt) {
            const userText = isUserPrompt.content?.[0]?.text;
            if (userText) setUserValue(userText);
        }
    }, [currentSystemPrompt, isUserPrompt, currentMessagesHistory]);

    return (
        <Sidebar>
            <SidebarHeader className="flex-row items-center justify-between gap-4 p-4 border-b-1">
                <h1 className="font-bold transition-colors text-primary hover:text-purple-500">reflectAI</h1>
                <div className="flex gap-6">
                    <SettingsSheet/>
                    <PromptVariablesSheet variables={systemUserArr}/>
                </div>
            </SidebarHeader>
            <SidebarContent className="flex grow flex-col gap-4 p-4">
                <PromptTextarea
                    value={systemValue}
                    onChange={handleChangeSystem}
                    onCommit={updateHistorySystem}
                    title="System prompt"
                    placeholder="Enter system prompt"
                    disabled={loadingMessages}
                />
                <PromptTextarea
                    isUser={true}
                    value={userValue}
                    onChange={handleChangeUser}
                    // onCommit={updateHistoryUser}
                    title="User prompt"
                    placeholder="Enter user prompt"
                    disabled={loadingMessages}
                />
            </SidebarContent>

            <SidebarFooter>
                {!containsAssistantId ?
                    <Button
                        onClick={handleRunContinue}
                        disabled={isRunButtonDisabled}
                        size="lg" variant="outlinePrimary"
                    > <Play/> Run
                    </Button>
                    :
                    <div className="flex gap-4 p-4 border-t-1 relative">
                        <div className={`flex gap-4 w-full transition-[height] ${textareaExpanded ? "h-60" : "h-22"}`}>
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
                            <div className="flex flex-col-reverse gap-4 justify-between items-end">
                                <Button
                                    onClick={handleRunContinue}
                                    disabled={isContinueRunDisabled}
                                    size="lg" variant="outlinePrimary"
                                >
                                    <Play/> Run
                                </Button>
                                <Button
                                    className=""
                                    variant="outline"
                                    size="iconSmall"
                                    onClick={toggleTextareaExpanded}
                                >
                                    <ChevronUpIcon
                                        className={`transition-transform ${textareaExpanded && "rotate-180"}`}/>
                                </Button>
                            </div>
                        </div>
                    </div>


                }
            </SidebarFooter>
        </Sidebar>
    );
}