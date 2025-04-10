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
import { cn } from "@/lib/utils.ts";
import { SheetWrapperProps } from "@/definitions/props";

export function SheetWrapper({title, side, icon, isWide, saveButton, disabled, children}: SheetWrapperProps) {
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
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="iconSmall" disabled={disabled}>
                    {triggerIcon}
                </Button>
            </SheetTrigger>
            <SheetContent side={side} className={cn(isWide && "sm:max-w-[40rem] lg:max-w-[60rem]", "gap-0")}>
                <SheetHeader>
                    <SheetTitle className="flex items-center h-7">{title}</SheetTitle>
                    <SheetDescription> Description goes here</SheetDescription>
                </SheetHeader>
                <hr/>
                <div className="flex flex-col gap-4 p-4 grow overflow-auto">
                    {children}
                </div>
                <hr/>
                {saveButton &&
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit">Save changes</Button>
                        </SheetClose>
                    </SheetFooter>
                }
            </SheetContent>
        </Sheet>

    )
}