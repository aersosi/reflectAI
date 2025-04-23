import { useSidebar } from "@/components/ui/sidebar";
import { ChatCard } from "@/components/app/Chat/ChatCard";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { Message } from "@/definitions/session";
import { PanelLeftIcon } from "lucide-react";
import { SessionNameInput } from "@/components/app/Chat/SessionNameInput";
import { SessionsSheet } from "@/components/app/Sheets/SessionsSheet";
import { useAnthropic } from "@/contexts/AnthropicContext";
import { useEffect, useRef } from "react";

export function Chat() {
    const {toggleSidebar} = useSidebar();
    const {loadingMessages, messagesError} = useAnthropic();
    const {currentMessagesHistory} = useSession();

    // Ref for scrolling
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({top: scrollAreaRef.current.scrollHeight, behavior: 'smooth'});
        }
    }, [currentMessagesHistory]);

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
    const getFirstTextMessage = (message: Message): string => {
        // Ensure content exists and is an array before finding
        if (message.content && Array.isArray(message.content)) {
            const textContent = message.content.find(part => part.type === 'text');
            return textContent?.text || ''; // Return text or empty string
        }
        return 'Error: content is missing or not an array';
    };

    // Helper function to determine title based on role
    const getTitleFromRole = (role: 'assistant' | 'user'): string => {
        return role === 'assistant' ? 'Assistant' : 'User';
    };

    return (
        <main className="flex flex-col grow h-full overflow-hidden">
            <div className="flex gap-4 p-4 justify-between border-b shrink-0">
                <div className="flex gap-4 items-center grow">
                    <CustomSidebarTrigger/>
                    <SessionNameInput/>
                </div>
                <SessionsSheet/>
            </div>
            <div className="flex flex-col gap-4 p-4 overflow-auto grow">
                {currentMessagesHistory && currentMessagesHistory.map(message => (
                    <ChatCard
                        key={message.id}
                        messageId={message.id}
                        isUser={message.role === 'user'}
                        title={getTitleFromRole(message.role)}
                        message={getFirstTextMessage(message)}
                    />
                ))}
                {loadingMessages && (
                    <ChatCard
                        key="loading"
                        isUser={false} // Or a neutral style
                        title="Assistant"
                        message="Thinking ..." // Or a spinner component
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
            <footer className="flex gap-4 px-4 py-2 justify-between border-t">
                <div>{currentMessagesHistory.length}</div>
                <div>All tokens: 123</div>
                <div>All token cost: 123</div>
            </footer>
        </main>
    );
}