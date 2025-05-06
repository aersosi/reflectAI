import { SidebarWrapperProps, TouchTargetProps } from "@/definitions/props";

const TouchTarget = ({children, onClick}: TouchTargetProps) => {
    return (
        <div className="flex items-center gap-4 mx-2 cursor-pointer w-fit pr-2 hover:text-purple-500"
             onClick={onClick}
        >
            {children}
        </div>
    );
};

export const SidebarWrapper = ({
                                   isExpanded,
                                   setIsExpanded,
                                   title,
                                   children,
                                   className,
                               }: SidebarWrapperProps) => {
    const handleToggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div
            className={`flex flex-col transition-all duration-300 ease-in-out 
            ${isExpanded ? "w-full" : "w-auto"} ${className}`}
        >
            {isExpanded ? (
                <TouchTarget onClick={handleToggleExpand}>
                    <h3 className="transition-colors">{title}</h3>
                </TouchTarget>
            ) : (
                <TouchTarget onClick={handleToggleExpand}> {/* Added onClick here */}
                    <h3 className="transition-colors [writing-mode:vertical-lr]">
                        {title}
                    </h3>
                </TouchTarget>
            )}

            {isExpanded && (
                <div className="flex flex-col gap-4 px-2 mt-4 mb-2 py-[2px] overflow-y-auto h-full">
                    {children}
                </div>
            )}
        </div>
    );
};