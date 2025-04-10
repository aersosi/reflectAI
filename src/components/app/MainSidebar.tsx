import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, } from "@/components/ui/sidebar"

import { useState } from "react";
import { PromptTextarea } from "@/components/lib/PromptTextarea.tsx";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, Play } from "lucide-react";
import { SettingsSheet } from "@/components/app/Sheets/SettingsSheet.tsx";
import { PromptVariablesSheet } from "@/components/app/Sheets/PromptVariablesSheet.tsx";
import { DataArray } from "@/definitions/api";

export function MainSidebar() {
    const [systemVariable, setSystemVariable] = useState('');
    const [userVariable, setUserVariable] = useState('');
    const [systemTitle, setSystemTitle] = useState('');
    const [userTitle, setUserTitle] = useState('');
    const [textareaExpanded, setTextareaExpanded] = useState(false);

    const toggleTextareaExpanded = () => {
        setTextareaExpanded(prev => !prev);
    };

    function extractVariables(str: string) {
        return str.match(/\{\{\s*([^}]+)\s*}}/g) || [];
    }


    const data: DataArray = [];

    // System variables
    const systemVars = extractVariables(systemVariable);
    if (systemVars.length > 0 && systemTitle) {
        data.push({
            title: systemTitle,
            variables: systemVars
        });
    }

    // User variables
    const userVars = extractVariables(userVariable);
    if (userVars.length > 0 && userTitle) {
        data.push({
            title: userTitle,
            variables: userVars
        });
    }

    const handleSystemVariableUpdate = (params: { value: string; id: string }) => {
        setSystemVariable(params.value);
        setSystemTitle(params.id);
    };

    const handleUserVariableUpdate = (params: { value: string; id: string }) => {
        setUserVariable(params.value);
        setUserTitle(params.id);
    };


    // {{test}}
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
                    onVariableChange={handleSystemVariableUpdate}
                    title="System prompt"
                    placeholder="Enter system prompt"
                />
                <PromptTextarea
                    isUser={true}
                    onVariableChange={handleUserVariableUpdate}
                    title="User prompt"
                    placeholder="Enter user prompt"
                />
            </SidebarContent>
            <SidebarFooter>
                <div className="flex gap-4 p-4 border-t-1 relative">
                    <div className={`flex gap-4 w-full transition-[height] ${textareaExpanded ? "h-60" : "h-22"}`}>
                        <div className="grow relative">
                            <Textarea placeholder="Type Question ..." className="absolute inset-0 resize-none"/>
                        </div>
                        <div className="flex flex-col-reverse gap-4 justify-between items-end">
                            <Button size="lg" variant="outlinePrimary"> <Play/> Run </Button>
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
