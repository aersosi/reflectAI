import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, Play } from "lucide-react";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { PromptVariablesSheet } from "@/components/app/Sheets/PromptVariablesSheet";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { AnthropicResponse, DataArray } from "@/definitions/api";
import { useAnthropic } from "@/contexts/AnthropicContext";

export function MainSidebar() {
    const [systemVariable, setSystemVariable] = useState('');
    const [userVariable, setUserVariable] = useState('');
    const [textareaExpanded, setTextareaExpanded] = useState(false);
    const {loadingMessages, callAnthropic, continueCallAnthropic} = useAnthropic();
    const {currentAppState, updateSession} = useSession();

    const toggleTextareaExpanded = () => {
        setTextareaExpanded(prev => !prev);
    };

    const extractVariables = (str: string): string[] => {
        return str.match(/\{\{\s*([^}]+)\s*}}/g) || [];
    }

    const data: DataArray = [];

    // todo: integrate variables later into the whole flow
    const systemVars = extractVariables(systemVariable);
    if (systemVars.length > 0) data.push({title: "System prompt", variables: systemVars});
    const userVars = extractVariables(userVariable);
    if (userVars.length > 0) data.push({title: "User prompt", variables: userVars});

    // use the userPromt loaded in useEffect to trigger Anthropic Api call
    const handleRunPrompt = () => callAnthropic(userVariable.trim(), systemVariable.trim());
    const handleContinuePrompt = () => continueCallAnthropic(userVariable.trim(), systemVariable.trim()); // todo: delete when not needed anymore

    const handleChangeSystem = (value: string) => setSystemVariable(value)
    const handleCommitSystem = (value: string) => {
        if (value === currentAppState.systemPrompt) return; // is value did not change
        updateSession("appState.systemPrompt", value);
    };

    const handleChangeUser = (value: string) => setUserVariable(value);
    const handleCommitUser = (value: string) => {
        const previousText = currentAppState.messagesHistory.find(message => message.id === "user-prompt")?.content[0].text ?? "";
        if (value === previousText) return;

        const userMessage: AnthropicResponse = {
            id: `user-prompt`,
            type: "message",
            role: "user",
            content: [{ type: "text", text: value }]
        };
        updateSession("appState.messagesHistory", userMessage);
    };

    const isRunButtonDisabled = loadingMessages || (!systemVariable.trim() && !userVariable.trim());

    useEffect(() => {
        // load stored values into PromptTextareas
        if (currentAppState.systemPrompt) setSystemVariable(currentAppState.systemPrompt);
        if (currentAppState.messagesHistory[0]?.id === "user-prompt") {
            setUserVariable(currentAppState.messagesHistory[0].content[0].text);
        }
    }, [currentAppState.systemPrompt, currentAppState.messagesHistory]);

    return (
        <Sidebar>
            <SidebarHeader className="flex-row items-center justify-between gap-4 p-4 border-b-1">
                <h1 className="font-bold transition-colors text-primary hover:text-purple-500">reflectAI</h1>
                <div className="flex gap-6">
                    <SettingsSheet/>
                    <PromptVariablesSheet data={data}/>
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
                <Button onClick={handleRunPrompt} disabled={isRunButtonDisabled}
                        size="lg" variant="outlinePrimary">
                    <Play/> Run
                </Button>
            </SidebarContent>

            {/*Footer should only be visible if there was an initial call, so there are entries in messageHistory*/}
            {/*if (currentAppState.messagesHistory.length > 0)*/}
            <SidebarFooter>
                <div className="flex gap-4 p-4 border-t-1 relative">
                    <div className={`flex gap-4 w-full transition-[height] ${textareaExpanded ? "h-60" : "h-22"}`}>
                        <div className="grow relative">
                            <Textarea placeholder="Type follow up question ..."
                                      className="absolute inset-0 resize-none"/>
                        </div>
                        <div className="flex flex-col-reverse gap-4 justify-between items-end">
                            <Button
                                onClick={handleContinuePrompt} // todo: use handleRunPrompt
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
                                <ChevronUpIcon className={`transition-transform ${textareaExpanded && "rotate-180"}`}/>
                            </Button>
                        </div>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}