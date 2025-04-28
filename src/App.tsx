import { Sidebars } from "@/components/app/sidebars/Sidebars";
import { Chat } from "@/components/app/Chat/Chat";

function App() {
    return (
            <div className="flex">
                <Sidebars/>
                <Chat/>
            </div>
    )
}

export default App
