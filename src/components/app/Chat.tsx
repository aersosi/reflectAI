import { useSidebar } from "@/components/ui/sidebar";
import { ChatCard } from "@/components/app/Chat/ChatCard.tsx";
import { Post } from "@/definitions/api";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon } from "lucide-react";
import { SessionNameInput } from "@/components/app/Chat/SessionNameInput";
import { SessionsSheet } from "@/components/app/Sheets/SessionsSheet.tsx";

export function Chat({posts}: { posts: Post[] }) {
    function CustomSidebarTrigger() {
        const {toggleSidebar} = useSidebar()
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


    return (
        <main className="flex flex-col grow">
            <div className="flex gap-4 p-4 justify-between border-b-1">
                <div className="flex gap-4 items-center grow">
                    <CustomSidebarTrigger/>
                    <SessionNameInput/>
                </div>
                <SessionsSheet/>
            </div>
            <div className="flex flex-col gap-4 shrink overflow-auto p-4">
                {posts.map(post => (
                    post.id % 2 === 0 ?
                        <ChatCard isUser={true} key={post.id} title="User"
                                  message={post.title}></ChatCard> :
                        <ChatCard isUser={false} key={post.id} title="Agent"
                                  message={post.title}></ChatCard>
                ))}
            </div>
        </main>
    );
}
