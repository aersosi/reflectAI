import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card"
import { CardMessageProps } from "@/definitions/types";
import { cn } from "@/lib/utils.ts";

export function CardMessage({className, isUser, title, message}: CardMessageProps) {
    const roleMargin = isUser ? "xl:ml-56" : "xl:mr-56";
    const roleColor =
        isUser ?
        "border-purple-500/30 shadow-purple-500/30" :
        "border-primary/40  shadow-primary/40";

    return (
        <div className={cn("flex gap-4 items-center", roleMargin, className)}>
            <Card className={cn(roleColor, "grow gap-0")}>
                <CardHeader className="xl:hidden">
                    <CardDescription>{title}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{message}</p>
                </CardContent>
            </Card>
        </div>
    );
}

