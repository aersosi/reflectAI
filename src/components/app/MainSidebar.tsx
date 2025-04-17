import { useState } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, Play } from "lucide-react";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet";
import { PromptVariablesSheet } from "@/components/app/Sheets/PromptVariablesSheet";
import { PromptTextarea } from "@/components/lib/PromptTextarea";
import { DataArray } from "@/definitions/api";
import { useAnthropic } from "@/contexts/AnthropicContext";

export function MainSidebar() {
    const [systemVariable, setSystemVariable] = useState('');
    const [userVariable, setUserVariable] = useState('');
    const [textareaExpanded, setTextareaExpanded] = useState(false);
    const {loadingMessages, generateUserPrompt, generateSystemPrompt} = useAnthropic();

    const toggleTextareaExpanded = () => {
        setTextareaExpanded(prev => !prev);
    };

    function extractVariables(str: string): string[] {
        return str.match(/\{\{\s*([^}]+)\s*}}/g) || [];
    }

    const data: DataArray = [];
    const systemVars = extractVariables(systemVariable);
    if (systemVars.length > 0) {
        data.push({title: "System prompt", variables: systemVars});
    }
    const userVars = extractVariables(userVariable);
    if (userVars.length > 0) {
        data.push({title: "User prompt", variables: userVars});
    }

    const handleGenerateClick = () => {
        generateSystemPrompt(systemVariable.trim());
        generateUserPrompt(userVariable.trim());
    };

    const isRunButtonDisabled = loadingMessages || (!systemVariable.trim() && !userVariable.trim());

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
                    onVariableChange={setSystemVariable}
                    title="System prompt"
                    placeholder="Enter system prompt"
                    disabled={loadingMessages}
                />
                <PromptTextarea
                    value={userVariable}
                    isUser={true}
                    onVariableChange={setUserVariable}
                    title="User prompt"
                    placeholder="Enter user prompt"
                    disabled={loadingMessages}
                />
            </SidebarContent>
            <SidebarFooter>
                <div className="flex gap-4 p-4 border-t-1 relative">
                    <div className={`flex gap-4 w-full transition-[height] ${textareaExpanded ? "h-60" : "h-22"}`}>
                        <div className="grow relative">
                            <Textarea placeholder="Type Question ..." className="absolute inset-0 resize-none"/>
                        </div>
                        <div className="flex flex-col-reverse gap-4 justify-between items-end">
                            <Button onClick={handleGenerateClick} disabled={isRunButtonDisabled}
                                    size="lg" variant="outlinePrimary">
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