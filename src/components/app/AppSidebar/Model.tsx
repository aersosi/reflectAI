import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label.tsx";


export type CardMessageProps = {
    data?: string[],
    placeholder?: string;
    labelTitle?: string;
    labelFor?: string
};

export function Model({data, placeholder, labelTitle, labelFor}: CardMessageProps) {
    return (
        <div className="flex flex-col items-start gap-4 w-full">
            {labelFor && labelTitle &&
                <Label htmlFor={labelFor} className="pl-0.5 text-muted-foreground">
                    {labelTitle}</Label>
            }
            <Select>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {data?.map((value, index) => (
                            <SelectItem className="hover:bg-primary/10" key={index}
                                        value={value.toLowerCase()}>{value}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>


    )
}
