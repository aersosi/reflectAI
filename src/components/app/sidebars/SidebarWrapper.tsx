import { Button } from "@/components/ui/button";
import { SidebarWrapperProps } from "@/definitions/props";
import { ChevronsLeftRight, ChevronsRightLeft } from "lucide-react";

export const SidebarWrapper = ({isExpanded, setIsExpanded, title, children, className}: SidebarWrapperProps) => {
    return (
        <div className={` ${className} flex flex-col ${isExpanded ? 'w-full' : ''}`}>
            {isExpanded ?
                (
                    <div
                        className="flex items-center gap-4 mx-2 cursor-pointer"
                        onClick={() => setIsExpanded((prev) => !prev)}
                    >
                        <Button variant="outline" size="iconSmall">
                            <ChevronsRightLeft/>
                        </Button>
                        <h3>{title}</h3>
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center gap-4 px-2 cursor-pointer"
                        onClick={() => setIsExpanded((prev) => !prev)}
                    >
                        <Button variant="outline" size="iconSmall">
                            <ChevronsLeftRight/>
                        </Button>
                        <h3 className="[writing-mode:vertical-lr]">{title}</h3>
                    </div>
                )
            }
            <div className="flex flex-col gap-4 px-2 mt-4 mb-2 py-[2px] overflow-y-auto h-full">
                {isExpanded && children}
            </div>
        </div>
    );
};