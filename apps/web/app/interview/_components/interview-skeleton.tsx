import { Skeleton } from "@residency/ui/components/skeleton";

export const InterviewSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Skeleton className="w-[900px] h-[600px] mb-15" />
      <Skeleton className="w-[900px] h-[80px]" />
    </div>
  );
};
