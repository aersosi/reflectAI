import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from "@/components/ui/sidebar"

import { useState } from "react";
import MessageFragment from "@/components/lib/MessageFragment.tsx";
import { SessionSettings } from "@/components/app/AppSidebar/SessionSettings.tsx";

export function AppSidebar() {
    const [systemVariable, setSystemVariable] = useState('');
    const [userVariable, setUserVariable] = useState('');
    const combinedVariables = `${systemVariable} ${userVariable}`;
    const variables = combinedVariables.match(/\{\{\s*([^}]+)\s*}}/g) || [];

    const [systemTitle, setSystemTitle] = useState('');
    const [userTitle, setUserTitle] = useState('');
    const combinedTitles = `${systemTitle} ${userTitle}`;

    const handleSystemVariableUpdate = (params: { value: string; id: string }) => {
        setSystemVariable(params.value);
        setSystemTitle(params.id);
    };

    const handleUserVariableUpdate = (params: { value: string; id: string }) => {
        setUserVariable(params.value);
        setUserTitle(params.id);
    };

    return (
        <Sidebar>
            <SidebarHeader className="flex-row items-center justify-between gap-4 p-4 border-b-1">
                <h1 className="font-bold">reflectAI</h1>
                <SessionSettings />
            </SidebarHeader>
            <SidebarContent className="flex grow flex-col gap-4 p-4">
                {variables.map((variable, index) => (
                    <MessageFragment
                        key={`${variable}-${index}`}
                        title={`${combinedTitles}: ${variable.replace(/[{}]/g, '')}`}
                        placeholder={variable.replace(/[{}]/g, '')}
                    />
                ))}
                <MessageFragment
                    onVariableChange={handleSystemVariableUpdate}
                    title="System prompt"
                    placeholder="Enter system instructions"
                />
                <MessageFragment
                    onVariableChange={handleUserVariableUpdate}
                    title="User prompt"
                    placeholder="Enter user message template"
                />
            </SidebarContent>
        </Sidebar>
    );
}
