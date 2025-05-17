// "use client";

// import { ActionButton } from "@/components/action-button";
// import { Id, api } from "@residency/api";
// import { useAction } from "convex/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// interface ApproveButtonProps {
//   applicantId: Id<"applicants">;
// }
// const ApproveButton = ({ applicantId }: ApproveButtonProps) => {
//   const router = useRouter();
//   const approve = useAction(api.application.admin.approveIntake);
//   const [isDisabled, setIsDisabled] = useState(false);

//   const handleClick = async () => {
//     const sessionId = await approve({ applicantId });
//     setIsDisabled(true);
//     if (sessionId) router.push(`/interview/${applicantId}`);
//   };

//   return (
//     <div className="flex flex-col gap-2 mt-5">
//       <ActionButton
//         isDisabled={isDisabled}
//         handleClick={handleClick}
//         actionText="Approve Application*"
//         loadingText="Approving..."
//       />
//       <p className="text-gray-600 text-sm opacity-80 mt-2">
//         *Does not exist in production. Approving the application takes a couple
//         seconds since we need to generate the first interiew question.
//       </p>
//     </div>
//   );
// };
