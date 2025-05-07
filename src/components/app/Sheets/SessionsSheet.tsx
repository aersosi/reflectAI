import { AlertClose } from "@/components/lib/AlertClose";
import { useSession } from "@/contexts/SessionContext";
import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export const SessionsSheet = () => {
    const {sessions, deleteSession} = useSession();
    const [isAlert, setIsAlert] = useState(false);

    const handleDelete = (id: string) => {
        deleteSession(id)
        setIsAlert(false)
    }

    return (
        <SheetWrapper key="Sessions" title="Sessions" side="right" icon="list">
            {!sessions.length && <p>No sessions saved yet.</p>}
            <ul className="flex flex-col gap-2">
                {sessions.map(session => (
                    <>
                        <li key={session.id} className="flex w-full justify-between items-center gap-4 rounded-lg p-2 pl-3
                            transition border hover:border-primary/50 hover:ring-[3px] ring-primary/50">
                            <a href={`/?sessionId=${session.id}`}>
                                {session.title} ({new Date(session.date).toLocaleString()})
                            </a>
                            <Button onClick={() => setIsAlert(true)} variant="ghost"
                                    size="iconSmall">
                                <Trash2></Trash2>
                            </Button>
                        </li>
                        {isAlert &&
                            <AlertClose
                                destructive
                                title={`Do you want to delete session ${session.title} ?`}
                            >
                                <div className="flex gap-2 justify-end w-full pt-2">
                                    <Button size={"xs"} variant={"ghost"}
                                            onClick={() => setIsAlert(false)}>Cancel</Button>
                                    <Button size={"xs"} variant={"outline"}
                                            onClick={() => handleDelete(session.id)}>Delete</Button>
                                </div>
                            </AlertClose>

                        }
                    </>
                ))}
            </ul>
        </SheetWrapper>
    );
};
