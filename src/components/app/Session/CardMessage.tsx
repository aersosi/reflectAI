import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card"
import { CardMessageProps } from "@/definitions/types";

function CardMessage({className, title, message}: CardMessageProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardDescription>{title}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>{message}</p>
            </CardContent>
        </Card>
    );
}

export default CardMessage;

