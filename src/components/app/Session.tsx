import { SidebarTrigger } from "@/components/ui/sidebar.tsx";
import TextareaUser from "./Session/TextareaUser.tsx";
import CardMessage from "./Session/CardMessage.tsx";
import { Post } from "@/definitions/types";

export function Session({posts}: { posts: Post[] }) {
    return (
        <main className="flex flex-col grow">
            <div className="flex gap-4 p-4 justify-between border-b-1">
                <div className="flex gap-4 items-center">
                    <SidebarTrigger/>
                    <h2 className="font-bold">Session Name</h2>
                </div>
                <div>Open/Close Sessions</div>
            </div>
            <div className="flex flex-col gap-4 shrink overflow-auto p-4">
                {posts.map(post => (
                    post.id % 2 === 0 ?
                        <CardMessage className="xl:ml-64" key={post.id} title="User"
                                     message={post.title}></CardMessage> :
                        <CardMessage className="xl:mr-64" key={post.id} title="Agent"
                                     message={post.title}></CardMessage>
                ))}
            </div>
            <div className="flex gap-4 p-4 border-t-1">
                <TextareaUser></TextareaUser>
                <div className="flex flex-col gap-4">
                    <div>Open/Close Textarea</div>
                    <div>Send Input</div>
                </div>
            </div>
        </main>
    );
}
