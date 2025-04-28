import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card"
import { useSession } from "@/contexts/SessionContext";
import { CardMessageProps } from "@/definitions/props";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export function ChatCard({className, messageId, isUser, title, message}: CardMessageProps) {
    const {deleteMessage} = useSession();

    const roleColor =
        isUser ?
        "border-purple-500/30 shadow-purple-500/30" :
        "border-primary/40 shadow-primary/40";

    return (
        <div className={cn("flex gap-4 items-center", className)}>
            <Card className={cn(roleColor, "w-full gap-0")}>
                <CardHeader>
                    <CardDescription className="flex justify-between items-center">
                        <span>{title}</span>
                        <span>{messageId}</span>
                        <Button onClick={() => deleteMessage(messageId)} variant="ghostDestructive" size="iconSmall">
                            <Trash2></Trash2>
                        </Button>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{message}</p>
                </CardContent>
            </Card>
        </div>
    );
}

