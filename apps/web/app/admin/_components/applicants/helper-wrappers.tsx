import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@residency/ui/components/accordion";
import { Button } from "@residency/ui/components/button";
import { Card, CardContent } from "@residency/ui/components/card";
import { Separator } from "@residency/ui/components/separator";
import { Skeleton } from "@residency/ui/components/skeleton";

export const CardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="w-full py-6">
      <CardContent className="px-6 flex flex-col space-y-3">
        {children}
      </CardContent>
    </Card>
  );
};

export const KanbanWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-row gap-4 overflow-x-auto pb-4">{children}</div>
  );
};

interface ListWrapperProps {
  children: React.ReactNode;
  status: "LoadingFirstPage" | "LoadingMore" | "Exhausted" | "CanLoadMore";
  loadMore: (numItems: number) => void;
  title: string;
}
export const ListWrapper = ({
  children,
  status,
  loadMore,
  title,
}: ListWrapperProps) => {
  return (
    <div className="flex flex-col gap-4 w-lg">
      <h1 className="text-xl font-medium">{title}</h1>
      {status !== "LoadingFirstPage" ? (
        <>
          {children}
          {status !== "Exhausted" && (
            <div className="flex justify-start mt-6">
              <Button
                variant="outline"
                onClick={() => loadMore(10)}
                disabled={status === "LoadingMore"}
              >
                {status === "LoadingMore" ? "loading..." : "load more"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ListSkeleton />
      )}
    </div>
  );
};

const ListSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <CardWrapper key={i}>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardWrapper>
      ))}
    </div>
  );
};

interface FooterWrapperProps {
  children: React.ReactNode;
}
export const FooterWrapper = ({ children }: FooterWrapperProps) => {
  return (
    <div>
      <Separator className="my-2" />
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
};

interface AdditionalWrapperProps {
  children: React.ReactNode;
  title: string;
}
export const AdditionalWrapper = ({
  children,
  title,
}: AdditionalWrapperProps) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="text-sm text-muted-foreground"
    >
      <AccordionItem value="background">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent className="space-y-3 mt-2">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
