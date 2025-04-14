import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { SliderProps } from "@/definitions/props";
import React, { useState } from "react";

export const SliderTooltip = React.forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProps>(
    ({className, showTooltip = false, hasMarks = false, labelTitle, labelFor, ...props}, ref) => {

        // Calculate the initial value based on props
        let calculatedInitialValue: number[];
        if (props.defaultValue) {
            // Ensure defaultValue is always treated as an array
            calculatedInitialValue = Array.isArray(props.defaultValue)
                ? [...props.defaultValue]
                : [props.defaultValue];
        } else if (props.max !== undefined) { // Check if max prop exists
            calculatedInitialValue = [props.max]; // Default to max value
        } else {
            calculatedInitialValue = [0]; // Fallback if no defaultValue and no max
        }

        const [value, setValue] = React.useState<number[]>(calculatedInitialValue);
        const [showTooltipState, setShowTooltipState] = useState(false);

        // Calculate spacing for marks (if needed)
        const space = Math.floor(props.max && props.step ? (props.max / props.step) : 0);

        // --- Tooltip visibility handlers ---
        const handlePointerDown = () => {
            setShowTooltipState(true);
        };

        // Using useCallback for stable function reference in useEffect dependency array
        const handlePointerUp = React.useCallback(() => {
            setShowTooltipState(false);
        }, []);

        React.useEffect(() => {
            // Using document to catch pointer up even if it happens outside the slider thumb
            document.addEventListener("pointerup", handlePointerUp);
            return () => {
                document.removeEventListener("pointerup", handlePointerUp);
            };
        }, [handlePointerUp]);


        const handleValueChange = (val: number[]) => {
            setValue(val);
            props.onValueChange?.(val);
        }

        return (
            <div className="grid gap-6 py-2">
                {
                    labelFor && labelTitle &&
                    <Label htmlFor={labelFor}
                           className="flex justify-between pl-0.5 text-muted-foreground"> {/* Use flex for better alignment */}
                        <span>{labelTitle}</span><span>{value[0]}</span>
                    </Label>
                }

                <SliderPrimitive.Root
                    defaultValue={calculatedInitialValue}
                    ref={ref}
                    className={cn(
                        "relative flex w-full touch-none select-none items-center",
                        className
                    )}
                    onValueChange={handleValueChange}
                    onPointerDown={handlePointerDown}
                    {...props} // Pass all other slider props (max, min, step, disabled etc.)
                >

                    <SliderPrimitive.Track
                        className="relative h-1 w-full grow overflow-hidden rounded-full bg-primary/20">
                        <SliderPrimitive.Range className="absolute h-full bg-primary"/>
                    </SliderPrimitive.Track>

                    {hasMarks && space > 0 &&
                        <div className="absolute inset-0 flex grow w-full items-center justify-between px-[7px]">
                            {Array.from({length: space + 1}).map((_, index) => (
                                <div key={index} className="w-1 h-2 rounded-full bg-primary"/>
                            ))}
                        </div>
                    }

                    <TooltipProvider>
                        <Tooltip open={showTooltip && showTooltipState}>
                            <TooltipTrigger asChild>
                                <SliderPrimitive.Thumb
                                    className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{value[0]}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </SliderPrimitive.Root>
            </div>
        );
    }
);

SliderTooltip.displayName = "SliderTooltip" // Add display name for better debugging