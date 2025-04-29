import { ChatCard } from "@/components/app/Chat/ChatCard";
import { useSession } from "@/contexts/SessionContext";
import { Message } from "@/definitions/session";
import { SessionNameInput } from "@/components/app/Chat/SessionNameInput";
import { SessionsSheet } from "@/components/app/Sheets/SessionsSheet";
import { useAnthropic } from "@/contexts/AnthropicContext";
import { useEffect, useRef } from "react";

export function Chat() {
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
        <main className="flex flex-col h-full w-fit grow overflow-hidden">
            <div className="flex gap-4 px-4 py-2 justify-between border-b shrink-0">
                <SessionNameInput/>
                <SessionsSheet/>
            </div>
            <div className="flex flex-col gap-4 px-4 pt-4 pb-2 overflow-auto grow">
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
            <footer className="flex gap-4 px-4 h-14 items-center justify-between border-t">
                <div>{currentMessagesHistory.length}</div>
                <div>All tokens: 123</div>
                <div>All token cost: 123</div>
            </footer>
        </main>
    );
}