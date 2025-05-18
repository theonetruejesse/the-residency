import { Button } from "@residency/ui/components/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@residency/ui/lib/utils";

interface ActionButtonProps {
  handleClick?: (args: any) => Promise<any>;
  isDisabled?: boolean;
  actionText: string;
  loadingText: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const ActionButton = ({
  handleClick,
  isDisabled = false,
  actionText,
  loadingText,
  className,
  type = "button",
}: ActionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [isDisabled]);

  const onClick = async (e: any) => {
    if (type === "submit") {
      // For submit buttons, don't preventDefault so the form's onSubmit can run
      if (!handleClick) return;
    } else {
      // For non-submit buttons, use the handleClick directly
      setIsLoading(true);
      if (!handleClick) return;

      try {
        await handleClick(e);
      } catch (error) {
        console.error("Action failed:", error);
      }
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      type={type}
      className={cn(
        "w-full text-xl p-6 mt-6 bg-gray-900 hover:bg-gray-800",
        className
      )}
      onClick={onClick}
      disabled={isLoading || isDisabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          {loadingText}
        </>
      ) : (
        actionText
      )}
    </Button>
  );
};
