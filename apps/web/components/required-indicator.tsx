import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@residency/ui/components/tooltip";

// Required field indicator with tooltip
export const RequiredIndicator = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-red-500 ml-[-3px]">*</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>this field is required</p>
      </TooltipContent>
    </Tooltip>
  );
};
