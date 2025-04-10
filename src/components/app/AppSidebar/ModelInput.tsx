import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { ModelInputProps } from "@/definitions/types";

export function ModelInput({data, placeholder, labelTitle, labelFor}: ModelInputProps) {
    return (
        <div className="flex flex-col items-start gap-4 w-full">
            {labelFor && labelTitle && (
                <Label htmlFor={labelFor} className="pl-0.5 text-muted-foreground">
                    {labelTitle}
                </Label>
            )}
            <Select>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder || "Select a model"}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {data?.map((value) => (
                            <SelectItem
                                className="hover:bg-primary/10 cursor-pointer"
                                key={value.model}
                                value={value.model}
                            >
                                {value.model}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
