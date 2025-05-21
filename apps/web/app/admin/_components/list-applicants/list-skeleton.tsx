import { Card, CardContent } from "@residency/ui/components/card";
import { Skeleton } from "@residency/ui/components/skeleton";

export const ListSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="w-full max-w-xl">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      ))}
    </>
  );
};
