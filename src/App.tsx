import { MainSidebar } from "@/components/app/MainSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Chat } from "@/components/app/Chat";

function App() {
    return (
        <SidebarProvider className="h-full">
            <MainSidebar/>
            <Chat/>
        </SidebarProvider>
    )
}

export default App
