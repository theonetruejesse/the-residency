import { Button } from "@residency/ui/components/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@residency/ui/lib/utils";

interface ActionButtonProps {
  handleClick?: () => Promise<void> | void;
  isDisabled?: boolean;
  actionText: string;
  loadingText: string;
  className?: string;
}

export const ActionButton = ({
  handleClick,
  isDisabled = false,
  actionText,
  loadingText,
  className,
}: ActionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [isDisabled]);

  const onClick = async () => {
    setIsLoading(true);
    if (!handleClick) return;

    try {
      await handleClick();
    } catch (error) {
      console.error("Action failed:", error);
    }
    setIsLoading(false);
  };

  return (
    <Button
      size="lg"
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
