import { Button } from "@/components/ui/button";
import { Session,SidebarMain } from "@/components";

function App() {
    return (
        <div className="flex gap-4">
            <SidebarMain />
            <Session />
            <Button>Click me</Button>
        </div>
    )
}

export default App
