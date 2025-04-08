import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, } from "@/components/ui/sidebar"

import { useState } from "react";
import MessageFragment from "@/components/lib/MessageFragment.tsx";
import { SessionSettings } from "./AppSidebar/SessionSettings.tsx";
import Model from "./AppSidebar/Model.tsx";
import MaxTokens from "./AppSidebar/MaxTokens.tsx";
import SliderTooltip from "./AppSidebar/SliderTooltip.tsx";
import ApiKey from "./AppSidebar/ApiKey.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button.tsx";
import { ChevronUpIcon, Play } from "lucide-react";

export function AppSidebar() {
    const [systemVariable, setSystemVariable] = useState('');
    const [userVariable, setUserVariable] = useState('');
    const [systemTitle, setSystemTitle] = useState('');
    const [userTitle, setUserTitle] = useState('');
    const [textareaExpanded, setTextareaExpanded] = useState(false);
    const [sliderValue, setSliderValue] = useState([0]);
    const toggleTextareaExpanded = () => {
        setTextareaExpanded(prev => !prev);
    };


    function extractVariables(str: string) {
        return str.match(/\{\{\s*([^}]+)\s*}}/g) || [];
    }

    const data: Array<{ title: string; variables: string[] }> = [];
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
                <div className="flex gap-4">
                    <SessionSettings key="SessionSettings" title="Session Settings" side="left" icon="settings"
                                     saveButton={true}>
                        <div className="grid gap-8">
                            <Model></Model>
                            <MaxTokens></MaxTokens>
                            <div className="grid gap-6">
                                    <Label htmlFor="SliderTemperature" className="pl-0.5 text-muted-foreground">
                                        Model Temperature {...sliderValue}</Label>
                                <SliderTooltip
                                    id="SliderTemperature"
                                    max={1}
                                    step={0.05}
                                    hasMarks={true}
                                    showTooltip={true}
                                    onValueCommit={setSliderValue}
                                />
                            </div>
                            <ApiKey></ApiKey>
                        </div>
                    </SessionSettings>


                    <SessionSettings key="SessionVariables" title="Session Variables" side="right" icon="braces"
                                     saveButton={true} disabled={data.length === 0}>
                        {data.map((vars, index) => (
                            vars.variables.map((singleVar: string) => (
                                <MessageFragment
                                    isUser={vars.title.toLowerCase().includes("user")}
                                    isVariable={true}
                                    key={`${singleVar}-${index}`}
                                    title={`${vars.title.replace("prompt", "variable")}: ${singleVar}`}
                                    placeholder={singleVar}
                                />
                            ))
                        ))}
                    </SessionSettings>
                </div>
            </SidebarHeader>
            <SidebarContent className="flex grow flex-col gap-4 p-4">
                <MessageFragment
                    onVariableChange={handleSystemVariableUpdate}
                    title="System prompt"
                    placeholder="Enter system prompt"
                />
                <MessageFragment
                    isUser={true}
                    onVariableChange={handleUserVariableUpdate}
                    title="User prompt"
                    placeholder="Enter user prompt"
                />
            </SidebarContent>
            <SidebarFooter>
                <div className="flex gap-4 p-4 border-t-1 relative">
                    <div className={`flex gap-4 w-full transition-[height] ${textareaExpanded ? "h-20" : "h-60"}`}>
                        <div className="grow relative">
                            <Textarea placeholder="Type Question ..." className="absolute inset-0 resize-none"/>
                        </div>
                        <div className="flex flex-col-reverse gap-4 justify-between items-end">
                            <Button onClick={toggleTextareaExpanded}> <Play/> Run </Button>
                            <Button
                                className=""
                                variant="outline"
                                size="iconSmall"
                                onClick={toggleTextareaExpanded}
                            >
                                <ChevronUpIcon
                                    className={`transition-transform ${!textareaExpanded && "rotate-180"}`}/>
                            </Button>
                        </div>
                    </div>
                </div>

            </SidebarFooter>
        </Sidebar>
    );
}
