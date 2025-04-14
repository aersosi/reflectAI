import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

export const SessionsSheet = () => {
    const {sessions, deleteSession} = useSession();

    return (
            <SheetWrapper key="Sessions" title="Sessions" side="right" icon="list">
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
        </SheetWrapper>
    );
};
