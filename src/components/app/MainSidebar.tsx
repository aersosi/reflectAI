import { FollowUpTextarea } from "@/components/lib/FollowUpTextarea";
import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, Play } from "lucide-react";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { PromptVariablesSheet } from "@/components/app/Sheets/PromptVariablesSheet";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { AnthropicResponse } from "@/definitions/api";
import { DataArray } from "@/definitions/variables";
import { useAnthropic } from "@/contexts/AnthropicContext";

export function MainSidebar() {
    const [systemVariable, setSystemVariable] = useState('');
    const [userVariable, setUserVariable] = useState('');
    const [userContinue, setUserContinue] = useState('');
    const [textareaExpanded, setTextareaExpanded] = useState(false);
    const {loadingMessages, callAnthropic} = useAnthropic();
    const {currentAppState, overwriteSession, appendToMessagesHistory} = useSession();

    const extractVariables = (str: string): string[] => {
        return str.match(/\{\{\s*([^}]+)\s*}}/g) || [];
    }

    const systemUserVariables: DataArray = [];

    // todo: integrate variables later into the whole flow
    const systemVars = extractVariables(systemVariable);
    if (systemVars.length > 0) systemUserVariables.push({title: "System prompt", variables: systemVars});
    const userVars = extractVariables(userVariable);
    if (userVars.length > 0) systemUserVariables.push({title: "User prompt", variables: userVars});

    const handleChangeSystem = (value: string) => setSystemVariable(value)
    const handleCommitSystem = (value: string) => {
        if (value === currentAppState.systemPrompt) return; // is value did not change
        overwriteSession("appState.systemPrompt", value);
    };

    const handleChangeUser = (value: string) => setUserVariable(value);

    // if the value passed to handleCommitUser is the same as currentAppState.messagesHistory.message.id === "user_prompt" -> return

    const handleCommitUser = (value: string) => {
        const isUserPrompt = currentAppState.messagesHistory.find(
            (msg) => msg.id === "user_prompt"
        );

        const previousText = isUserPrompt?.content?.[0]?.text ?? "";
        if (value === previousText) return;

        const userMessage: AnthropicResponse = {
            id: `user_prompt`,
            type: "message",
            role: "user",
            content: [{type: "text", text: value}]
        };
        appendToMessagesHistory(userMessage);

    };

    const handleChangeContinue = (value: string) => setUserContinue(value);

    const handleCommitContinue = async (): Promise<AnthropicResponse | null> => {
        const userMessage: AnthropicResponse = {
            id: `user_${crypto.randomUUID()}`,
            type: "message",
            role: "user",
            content: [{type: "text", text: userContinue}]
        };

        appendToMessagesHistory(userMessage);
        return userMessage;
    };

    const handleRun = async () => {
        const newMessage = await handleCommitContinue();

        const updatedMessages = newMessage
            ? [...currentAppState.messagesHistory, newMessage]
            : currentAppState.messagesHistory;

        await callAnthropic(updatedMessages, systemVariable.trim());
    };

    const toggleTextareaExpanded = () => {
        setTextareaExpanded(prev => !prev);
    };

    const isRunButtonDisabled = loadingMessages || !userVariable.trim();

    const containsAssistantId = currentAppState.messagesHistory.some((msg) =>
        msg.id && msg.id.startsWith("assistant")
    );


    // load Values on Start
    useEffect(() => {
        console.log(userVariable.length);
        console.log(isRunButtonDisabled);

        if (currentAppState.systemPrompt) setSystemVariable(currentAppState.systemPrompt);
        if (currentAppState.messagesHistory.length > 0) {
            setUserVariable(currentAppState.messagesHistory[0].content[0].text);
        }
    }, [currentAppState.systemPrompt, currentAppState.messagesHistory]);


    return (
        <Sidebar>
            <SidebarHeader className="flex-row items-center justify-between gap-4 p-4 border-b-1">
                <h1 className="font-bold transition-colors text-primary hover:text-purple-500">reflectAI</h1>
                <div className="flex gap-6">
                    <SettingsSheet/>
                    <PromptVariablesSheet variables={systemUserVariables}/>
                </div>
            </SidebarHeader>
            <SidebarContent className="flex grow flex-col gap-4 p-4">
                <PromptTextarea
                    value={systemVariable}
                    onChange={handleChangeSystem}
                    onCommit={handleCommitSystem}
                    title="System prompt"
                    placeholder="Enter system prompt"
                    disabled={loadingMessages}
                />
                <PromptTextarea
                    isUser={true}
                    value={userVariable}
                    onChange={handleChangeUser}
                    onCommit={handleCommitUser}
                    title="User prompt"
                    placeholder="Enter user prompt"
                    disabled={loadingMessages}
                />
            </SidebarContent>

            {/*Footer should only be visible if there was an initial call, so there are entries in messageHistory*/}
            {/*if (currentAppState.messagesHistory.length > 1 || contains message.id === ""assistant)*/}
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
                                <FollowUpTextarea
                                    isUser={true}
                                    value={userContinue}
                                    onChange={handleChangeContinue}
                                    // onCommit={handleCommitContinue}
                                    title="User prompt"
                                    placeholder="Type follow up question ..."
                                    disabled={loadingMessages}
                                />

                            </div>
                            <div className="flex flex-col-reverse gap-4 justify-between items-end">
                                <Button
                                    onClick={handleRun}
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