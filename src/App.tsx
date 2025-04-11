import { MainSidebar } from "@/components/app/MainSidebar.tsx";
import { Chat } from "@/components/app/Chat.tsx";
import { SidebarProvider } from "@/components/ui/sidebar";
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Post } from "@/definitions/api";
const retrievePosts = async () => {
    const response = await axios.get(
        "https://jsonplaceholder.typicode.com/posts",
    );
    return response.data;
};

function App() {
    const {data: posts, error, isLoading} = useQuery<Post[], Error>({
        queryKey: ['posts'],
        queryFn: retrievePosts,
    });

    if (isLoading) return <div>Loading posts...</div>;
    if (error) return <div>An error occurred: {error.message}</div>;

    return (
        <SidebarProvider className="h-full">
            <MainSidebar/>
            {posts && <Chat posts={posts}/>}
        </SidebarProvider>
    )
}

export default App
