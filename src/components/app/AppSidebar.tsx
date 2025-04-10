import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, } from "@/components/ui/sidebar"

import { useState } from "react";
import { MessageFragment } from "@/components/lib/MessageFragment.tsx";
import { MySheet } from "./AppSidebar/MySheet.tsx";
import { Model } from "./AppSidebar/Model.tsx";
import { SliderTooltip } from "../lib/SliderTooltip.tsx";
import { ApiKey } from "./AppSidebar/ApiKey.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ChevronUpIcon, Play } from "lucide-react";

export function AppSidebar() {
    const [systemVariable, setSystemVariable] = useState('');
    const [userVariable, setUserVariable] = useState('');
    const [systemTitle, setSystemTitle] = useState('');
    const [userTitle, setUserTitle] = useState('');
    const [textareaExpanded, setTextareaExpanded] = useState(false);
    const [temperatureValue, setTemperatureValue] = useState([0]);
    const [maxTokensValue, setMaxTokensValue] = useState([0]);


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


    const values = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]



    // {{test}}
    return (
        <Sidebar>
            <SidebarHeader className="flex-row items-center justify-between gap-4 p-4 border-b-1">
                <h1 className="font-bold transition-colors text-primary hover:text-purple-500">reflectAI</h1>
                <div className="flex gap-6">
                    <MySheet key="MySheet" title="Session Settings" side="left" icon="settings"
                                     saveButton={true}>
                        <div className="grid gap-12">
                            <Model key="aiModel" data={values} placeholder="Select a model" labelFor="aiModel" labelTitle="Model"></Model>
                            <SliderTooltip
                                id="SliderTemperature"
                                max={1}
                                step={0.1}
                                hasMarks={true}
                                showTooltip={true}
                                labelFor="SliderTemperature"
                                labelTitle="Temperature"
                                labelValue={temperatureValue[0]}
                                onValueCommit={setTemperatureValue}
                            />
                            <SliderTooltip
                                id="SliderMaxTokens"
                                max={4096}
                                step={4}
                                showTooltip={true}
                                labelFor="SliderMaxTokens"
                                labelTitle="Max tokens"
                                labelValue={maxTokensValue[0]}
                                onValueCommit={setMaxTokensValue}
                            />
                        </div>
                        <ApiKey className="mt-auto"></ApiKey>
                    </MySheet>

                    <MySheet key="SessionVariables" title="Session Variables" side="right" icon="braces" isWide={true}
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
                    </MySheet>
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
                                <ChevronUpIcon
                                    className={`transition-transform ${textareaExpanded && "rotate-180"}`}/>
                            </Button>
                        </div>
                    </div>
                </div>

            </SidebarFooter>
        </Sidebar>
    );
}
