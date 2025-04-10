import { AppSidebar } from "@/components/app/AppSidebar.tsx";
import { Session } from "@/components/app/Session.tsx";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { useEffect, useState } from "react";
import axios from 'axios';

function App() {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        axios.get('https://jsonplaceholder.typicode.com/posts')
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    return (
        <SidebarProvider className="h-full">
            <AppSidebar/>
            <Session posts={posts}/>
        </SidebarProvider>
    )
}

export default App
