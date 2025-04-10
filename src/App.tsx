import { AppSidebar } from "@/components/app/AppSidebar";
import { Session } from "@/components/app/Session";
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

    // Behandle Ladezustand
    if (isLoading) {
        return <div>Loading posts...</div>;
    }

    if (error) {
        return <div>An error occurred: {error.message}</div>;
    }

    return (
        <SidebarProvider className="h-full">
            <AppSidebar/>
            {posts && <Session posts={posts}/>}
        </SidebarProvider>
    )
}

export default App
