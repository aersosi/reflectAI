import { useSidebar } from "@/components/ui/sidebar";
import { CardMessage } from "./Session/CardMessage.tsx";
import { Post } from "@/definitions/types";
import { MySheet } from "@/components/app/AppSidebar/MySheet.tsx";
import { Button } from "@/components/ui/button.tsx";
import { PanelLeftIcon, Trash2 } from "lucide-react";
import { SessionNameInput } from "@/components/app/Session/SessionNameInput.tsx";
import { useSession } from "@/context/SessionContext.tsx";

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

    const {sessions, deleteSession} = useSession();

    return (
        <main className="flex flex-col grow">
            <div className="flex gap-4 p-4 justify-between border-b-1">
                <div className="flex gap-4 items-center grow">
                    <CustomSidebarTrigger/>
                    <SessionNameInput/>
                </div>
                <MySheet key="Sessions" title="Sessions" side="right" icon="list">
                    {!sessions.length && <p>No sessions saved yet.</p>}
                    <ul className="flex flex-col gap-2">
                        {sessions.map(session => (
                            <li key={session.id} className="flex w-full justify-between items-center gap-4 rounded-lg p-2 pl-3 transition
                            border hover:border-primary/50 [&:has(button:hover)]:border-destructive/50
                            hover:ring-[3px] ring-primary/50 [&:has(button:hover)]:ring-destructive/50">
                                <a href={`/?sessionId=${session.id}`}>
                                    {session.name} ({new Date(session.date).toLocaleString()})
                                </a>
                                <Button onClick={() => deleteSession(session.id)} variant="ghostDestructive" size="iconSmall">
                                    <Trash2></Trash2>
                                </Button>
                            </li>
                        ))}
                    </ul>

                </MySheet>
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
