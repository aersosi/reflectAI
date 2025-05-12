import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Braces, List, Settings, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetWrapperProps } from "@/definitions/props";

export function SheetWrapper({
                                 open,
                                 title,
                                 description,
                                 headerChildren,
                                 side,
                                 icon,
                                 isWide,
                                 disabled,
                                 children
                             }: SheetWrapperProps) {
    // Todo: on sheet close: -> check if changes:
    //  -> no: exit without saving
    //  -> yes: -> ask: "do you want to save?"
    //      -> yes: save messages and send toast "Settings saved"
    //      -> no: exit without saving

    let triggerIcon;
    if (icon === "settings") {
        triggerIcon = <Settings/>;
    } else if (icon === "braces") {
        triggerIcon = <Braces/>;
    } else if (icon === "list") {
        triggerIcon = <List/>;
    } else {
        triggerIcon = <Smile/>;
    }

    return (
        <Sheet open={open}>
            <SheetTrigger asChild>
                <Button variant="outline" size="iconSmall" disabled={disabled}>
                    {triggerIcon}
                </Button>
            </SheetTrigger>
            <SheetContent side={side} className={cn(isWide && "sm:max-w-[40rem] lg:max-w-[60rem]", "gap-0")}>
                <SheetHeader>
                    <SheetTitle className="flex items-center h-7">{title}</SheetTitle>
                    {(headerChildren || description) && (
                        <div className="flex justify-between items-center gap-2">
                            {headerChildren}
                            {description && <SheetDescription>{description}</SheetDescription>}
                        </div>
                    )}
                </SheetHeader>
                <hr/>
                <div className="flex flex-col gap-4 p-4 grow overflow-y-auto">
                    {children}
                </div>
                <hr/>
            </SheetContent>
        </Sheet>

    )
}