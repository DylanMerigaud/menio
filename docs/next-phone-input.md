Install Shadcn via CLI
Run the shadcn-ui init command to setup your project:

npx shadcn@latest init
Install necessary Shadcn components:
Run the shadcn add command to add the necessary shadcn components to your project:

npx shadcn@latest add input
npx shadcn@latest add button
npx shadcn@latest add command
npx shadcn@latest add toast
npx shadcn@latest add popover
npx shadcn@latest add scroll-area
Install necessary React Phone Number Input package:

npm install react-phone-number-input
To use the phone input component:
Snippets

phone-input.tsx

import _as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import_ as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
Command,
CommandEmpty,
CommandGroup,
CommandInput,
CommandItem,
CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
Popover,
PopoverContent,
PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
React.ComponentProps<"input">,
"onChange" | "value" | "ref"

> &
> Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {

    onChange?: (value: RPNInput.Value) => void;

};

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
({ className, onChange, ...props }, ref) => {
return (
<RPNInput.default
ref={ref}
className={cn("flex", className)}
flagComponent={FlagComponent}
countrySelectComponent={CountrySelect}
inputComponent={InputComponent}
smartCaret={false}
/\*\*
_Handles the onChange event.
_
_react-phone-number-input might trigger the onChange event as undefined
_ when a valid phone number is not entered. To prevent this,
_the value is coerced to an empty string.
_
_@param {E164Number | undefined} value - The entered value
_/
onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
{...props}
/>
);
},
);
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
HTMLInputElement,
React.ComponentProps<"input">

> (({ className, ...props }, ref) => (
> <Input

    className={cn("rounded-e-lg rounded-s-none", className)}
    {...props}
    ref={ref}

/>
));
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
disabled?: boolean;
value: RPNInput.Country;
options: CountryEntry[];
onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
disabled,
value: selectedCountry,
options: countryList,
onChange,
}: CountrySelectProps) => {
return (
<Popover>
<PopoverTrigger asChild>
<Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
          disabled={disabled}
        >
<FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
<ChevronsUpDown
className={cn(
"-mr-2 size-4 opacity-50",
disabled ? "hidden" : "opacity-100",
)}
/>
</Button>
</PopoverTrigger>
<PopoverContent className="w-[300px] p-0">
<Command>
<CommandInput placeholder="Search country..." />
<CommandList>
<ScrollArea className="h-72">
<CommandEmpty>No country found.</CommandEmpty>
<CommandGroup>
{countryList.map(({ value, label }) =>
value ? (
<CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                    />
) : null,
)}
</CommandGroup>
</ScrollArea>
</CommandList>
</Command>
</PopoverContent>
</Popover>
);
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
selectedCountry: RPNInput.Country;
onChange: (country: RPNInput.Country) => void;
}

const CountrySelectOption = ({
country,
countryName,
selectedCountry,
onChange,
}: CountrySelectOptionProps) => {
return (
<CommandItem className="gap-2" onSelect={() => onChange(country)}>
<FlagComponent country={country} countryName={countryName} />
<span className="flex-1 text-sm">{countryName}</span>
<span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
<CheckIcon
className={`ml-auto size-4 ${country === selectedCountry ? "opacity-100" : "opacity-0"}`}
/>
</CommandItem>
);
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
const Flag = flags[country];

return (
<span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:size-full">
{Flag && <Flag title={countryName} />}
</span>
);
};

export { PhoneInput };
