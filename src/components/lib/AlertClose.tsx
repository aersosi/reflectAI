import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ReactNode } from "react";

export const AlertClose = ({children, title, destructive = false,close = false}: {
    children: ReactNode,
    title: string,
    destructive: boolean
    close: boolean
}) => {
    return (
        <Alert className={`${close ? "hidden" : ""}`}>
            <AlertCircle className={`${destructive && "stroke-destructive"} h-4 w-4`}/>
            <AlertTitle className={`${destructive && "text-destructive"}`}>
                {title}
            </AlertTitle>
            <AlertDescription>
                {children}
            </AlertDescription>
        </Alert>
    )
};
