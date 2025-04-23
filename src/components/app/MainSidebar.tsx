import { ContinueTextarea } from "@/components/lib/ContinueTextarea";
import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, Play } from "lucide-react";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { PromptVariablesSheet } from "@/components/app/Sheets/PromptVariablesSheet";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { AnthropicResponse } from "@/definitions/api";
import { Message } from "@/definitions/session";
import { DataArray } from "@/definitions/variables";
import { useAnthropic } from "@/contexts/AnthropicContext";

export function MainSidebar() {
    const {loadingMessages, callAnthropic} = useAnthropic();
    const {currentAppState, currentMessagesHistory, overwriteSession, appendToMessagesHistory} = useSession();

    const [systemValue, setSystemValue] = useState('');
    const [userValue, setUserValue] = useState('');
    const [continueValue, setContinueValue] = useState('');
    const [localHistory, setLocalHistory] = useState<Message[]>(currentMessagesHistory);

    const currentSystemPrompt = currentAppState.systemPrompt;
    const [textareaExpanded, setTextareaExpanded] = useState(false);

    const extractVariables = (str: string): string[] => {
        return str.match(/\{\{\s*([^}]+)\s*}}/g) || [];
    }

    const systemUserArr: DataArray = [];

    // todo: integrate variables later into the whole flow
    const systemValues = extractVariables(systemValue);
    if (systemValues.length > 0) systemUserArr.push({title: "System prompt", variables: systemValues});
    const userValues = extractVariables(userValue);
    if (userValues.length > 0) systemUserArr.push({title: "User prompt", variables: userValues});


    const handleChangeSystem = (value: string) => setSystemValue(value)
    const handleChangeUser = (value: string) => setUserValue(value);
    const handleChangeContinue = (value: string) => setContinueValue(value);


    const handleCommitSystem = (value: string) => {
        if (value === currentSystemPrompt) return; // value unchanged -> don't add to messagesHistory
        overwriteSession("appState.systemPrompt", value);
    };

    const handleCommitUser = (value: string) => {
        const previousText = localHistory
            .find(msg => msg.id === "user_prompt")
            ?.content?.[0]?.text;
        if (value === previousText || !value.trim()) return; // value unchanged -> don't add to messagesHistory

        const userMessage: AnthropicResponse = {
            id: `user_prompt`,
            type: "message",
            role: "user",
            content: [{type: "text", text: value}]
        };
        setLocalHistory(prev => [...prev, userMessage]);
        appendToMessagesHistory(userMessage);
    };

    const handleRun = async () => {
        callAnthropic(localHistory, currentSystemPrompt);
    };

    const handleRunContinue = async () => {
        if (continueValue.length == 0) return

        const userMessage: AnthropicResponse = {
            id: `continue_${crypto.randomUUID()}`,
            type: "message",
            role: "user",
            content: [{type: "text", text: continueValue}],
        };

        const updatedHistory = [...localHistory, userMessage];
        setLocalHistory(updatedHistory);
        appendToMessagesHistory(userMessage);
        await callAnthropic(updatedHistory, currentSystemPrompt);
    };


    const toggleTextareaExpanded = () => {
        setTextareaExpanded(prev => !prev);
    };

    const isRunButtonDisabled = loadingMessages || !userValue.trim();

    const containsAssistantId = localHistory.some((msg) =>
        msg.id && msg.id.startsWith("assistant")
    );
    const isUserPrompt = currentMessagesHistory.find(msg => msg.id === "user_prompt");

    // load Values on Start
    useEffect(() => {
        setSystemValue(currentSystemPrompt || "");
        if (isUserPrompt) {
            const userText = isUserPrompt.content?.[0]?.text;
            if (userText) setUserValue(userText);
        }
        setLocalHistory(currentMessagesHistory);
    }, [currentSystemPrompt, localHistory, currentMessagesHistory]);

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
                    onCommit={handleCommitSystem}
                    title="System prompt"
                    placeholder="Enter system prompt"
                    disabled={loadingMessages}
                />
                <PromptTextarea
                    isUser={true}
                    value={userValue}
                    onChange={handleChangeUser}
                    onCommit={handleCommitUser}
                    title="User prompt"
                    placeholder="Enter user prompt"
                    disabled={loadingMessages}
                />
            </SidebarContent>

            <SidebarFooter>
                {!containsAssistantId ?
                    <Button
                        onClick={handleRun}
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
                                    // onCommit={handleCommitContinue}
                                    title="User prompt"
                                    placeholder="Type follow up question ..."
                                    disabled={loadingMessages}
                                />

                            </div>
                            <div className="flex flex-col-reverse gap-4 justify-between items-end">
                                <Button
                                    onClick={handleRunContinue}
                                    disabled={isRunButtonDisabled}
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