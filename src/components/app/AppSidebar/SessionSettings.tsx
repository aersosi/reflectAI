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
import { Settings } from "lucide-react";
import Model from "@/components/app/AppSidebar/Model.tsx";
import MaxTokens from "@/components/app/AppSidebar/MaxTokens.tsx";
import Temperature from "@/components/app/AppSidebar/Temperature.tsx";
import ApiKey from "@/components/app/AppSidebar/ApiKey.tsx";

export function SessionSettings() {
    return (
        <Sheet key="SessionSettings">
            <SheetTrigger asChild>
                <Button variant="ghost" size="iconSmall">
                    <Settings/>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="gap-0">
                <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 p-4">
                    <Model></Model>
                    <MaxTokens></MaxTokens>
                    <Temperature></Temperature>
                    <ApiKey></ApiKey>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Save changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}