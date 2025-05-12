import { AlertClose } from "@/components/lib/AlertClose";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/contexts/SessionContext";
import { SheetWrapper } from "@/components/lib/SheetWrapper";
import { Button } from "@/components/ui/button";
import { Download, Ellipsis, Trash2, Upload } from "lucide-react";
import { useState } from "react";


export const SessionsSheet = () => {
    const {sessions, deleteSession} = useSession();
    const [isAlert, setIsAlert] = useState(false);

    const handleDelete = (id: string) => {
        deleteSession(id)
        setIsAlert(false)
    }

    const UploadButton = () => (
        <Button variant="outlinePrimary" className="w-full mt-2" onClick={() => {
        }}>
            Upload Session
            <Upload/>
        </Button>
    );

    return (
        <SheetWrapper key="Sessions" title="Sessions" headerChildren={<UploadButton/>} side="right" icon="list">

            {!sessions.length && <p>No sessions saved yet.</p>}
            <ul className="flex flex-col gap-2">
                {sessions.map(session => (
                    <>
                        <li key={session.id} className="flex w-full justify-between items-center gap-4 rounded-lg p-2 pl-3
                            transition border hover:border-primary/50 hover:ring-[3px] ring-primary/50">
                            <a href={`/?sessionId=${session.id}`}>
                                {session.title} ({new Date(session.date).toLocaleString()})
                            </a>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="iconSmall">
                                        <Ellipsis/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        className="transition-colors hover:bg-primary/10"
                                        onClick={() => setIsAlert(true)}>
                                        Delete
                                        <Trash2/>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="transition-colors hover:bg-primary/10" onClick={() => {
                                    }}>
                                        Download
                                        <Download/>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
