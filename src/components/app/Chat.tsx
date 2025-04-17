import { useSidebar } from "@/components/ui/sidebar";
import { ChatCard } from "@/components/app/Chat/ChatCard"; // Correct path?
import { Button } from "@/components/ui/button";
import { PanelLeftIcon } from "lucide-react";
import { SessionNameInput } from "@/components/app/Chat/SessionNameInput";
import { SessionsSheet } from "@/components/app/Sheets/SessionsSheet"; // Correct path?
import { AnthropicResponse } from "@/definitions/api";
import { useAnthropic } from "@/contexts/AnthropicContext"; // Import the hook
import { useEffect, useRef } from "react";

export function Chat() {
    const {toggleSidebar} = useSidebar();
    const {
        messagesResponse, // Get the messages array from contexts
        loadingMessages, // Maybe show a loading indicator?
        messagesError // Maybe show an error message?
    } = useAnthropic();

    // Ref for scrolling
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({top: scrollAreaRef.current.scrollHeight, behavior: 'smooth'});
        }
    }, [messagesResponse]);

    function CustomSidebarTrigger() {
        return <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={toggleSidebar}>
            <PanelLeftIcon/>
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    }

    // Helper function to get the first text part of content
    const getFirstTextMessage = (message: AnthropicResponse): string => {
        // Ensure content exists and is an array before finding
        if (message.content && Array.isArray(message.content)) {
            const textContent = message.content.find(part => part.type === 'text');
            return textContent?.text || ''; // Return text or empty string
        }
        return ''; // Return empty string if content is missing or not an array
    };

    // Helper function to determine title based on role
    const getTitleFromRole = (role: 'assistant' | 'user'): string => {
        return role === 'assistant' ? 'Agent' : 'User';
    };

    return (
        <main className="flex flex-col grow h-full overflow-hidden"> {/* Ensure main takes height */}
            <div className="flex gap-4 p-4 justify-between border-b shrink-0"> {/* Header doesn't shrink */}
                <div className="flex gap-4 items-center grow">
                    <CustomSidebarTrigger/>
                    <SessionNameInput/>
                </div>
                <SessionsSheet/>
            </div>
            <div className="flex flex-col gap-4 p-4">
                {messagesResponse && messagesResponse.map(message => (
                    <ChatCard
                        key={message.id} // Use the unique ID from the message object
                        isUser={message.role === 'user'}
                        title={getTitleFromRole(message.role)}
                        message={getFirstTextMessage(message)}
                    />
                ))}
                {loadingMessages && (
                    <ChatCard
                        key="loading"
                        isUser={false} // Or a neutral style
                        title="Agent"
                        message="Thinking..." // Or a spinner component
                    />
                )}
                {messagesError && (
                    <ChatCard
                        key="error"
                        isUser={false} // Or a neutral/error style
                        title="Error"
                        message={`Failed to get response: ${messagesError.message}`}
                    />
                )}
            </div>
        </main>
    );
}