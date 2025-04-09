import { useSidebar } from "@/components/ui/sidebar";
import { CardMessage } from "./Session/CardMessage.tsx";
import { Post } from "@/definitions/types";
import { SessionSettings } from "@/components/app/AppSidebar/SessionSettings.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PanelLeftIcon } from "lucide-react";
import { SessionNameInput } from "@/components/app/Session/SessionNameInput.tsx";

export function Session({posts}: { posts: Post[] }) {
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
                <SessionSettings key="Sessions" title="Sessions" side="right" icon="list">
                    <p>Lorem</p>
                    <p>Ipsum</p>
                    <p>Dolor</p>
                </SessionSettings>
            </div>
            <div className="flex flex-col gap-4 shrink overflow-auto p-4">
                {posts.map(post => (
                    post.id % 2 === 0 ?
                        <CardMessage isUser={true} key={post.id} title="User"
                                     message={post.title}></CardMessage> :
                        <CardMessage isUser={false} key={post.id} title="Agent"
                                     message={post.title}></CardMessage>
                ))}
            </div>
        </main>
    );
}
