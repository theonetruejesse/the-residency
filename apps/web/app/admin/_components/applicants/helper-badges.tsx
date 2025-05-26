import type { FullApplicantType } from "@residency/api";
import { Badge } from "@residency/ui/components/badge";
import { ChevronDown } from "lucide-react";

export type Rankings = FullApplicantType["applicant"]["decision"]["ranking"];
export type StatusActions = "approve" | "waitlist" | "reject";
export type StatusStates = StatusActions | "pending";

export const ReferralBadge = ({ referrals }: { referrals: string }) => (
  <Badge variant="outline" className="bg-slate-100 lowercase font-normal">
    {`referred by: ${referrals}`}
  </Badge>
);

const rankingLabels: Record<Rankings, string> = {
  likely_accept: "likely accept",
  maybe_accept: "maybe accept",
  neutral: "neutral",
  maybe_reject: "maybe reject",
  likely_reject: "likely reject",
};

const rankingColors: Record<Rankings, string> = {
  likely_accept: "bg-green-50 text-green-700 border-green-200",
  maybe_accept: "bg-lime-50 text-lime-700 border-lime-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
  maybe_reject: "bg-yellow-50 text-yellow-700 border-yellow-200",
  likely_reject: "bg-red-50 text-red-700 border-red-200",
};

interface RankingBadgeProps {
  ranking: Rankings;
  isRankingText?: boolean;
}

export const RankingBadge = ({
  ranking,
  isRankingText = false,
}: RankingBadgeProps) => (
  <Badge
    variant="outline"
    className={`inline-block ${rankingColors[ranking]} `}
  >
    {`${isRankingText ? "ranking: " : ""}${rankingLabels[ranking]}`}
  </Badge>
);

export const RankingSelectBadge = ({ ranking }: { ranking: Rankings }) => (
  <Badge
    variant="outline"
    className={`inline-flex items-center gap-1 ${rankingColors[ranking]} font-semibold`}
  >
    {rankingLabels[ranking]}
    <ChevronDown className="h-3 w-3" />
  </Badge>
);

const statusColors: Record<StatusStates, string> = {
  pending: "bg-gray-50 text-gray-700 border-gray-200",
  approve: "bg-green-50 text-green-700 border-green-200",
  waitlist: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reject: "bg-red-50 text-red-700 border-red-200",
};

export const StatusBadge = ({ status }: { status: StatusStates }) => (
  <Badge
    variant="outline"
    className={`inline-block text-sm ${statusColors[status]}`}
  >
    {status}
  </Badge>
);

export const StatusSelectBadge = ({ status }: { status: StatusStates }) => (
  <Badge
    variant="outline"
    className={`inline-flex items-center gap-1 text-lg font-semibold ${statusColors[status]}`}
  >
    {status}
    <ChevronDown className="h-3 w-3" />
  </Badge>
);

type Rounds = FullApplicantType["applicant"]["decision"]["round"];

const roundLabels: Record<Rounds, string> = {
  intake: "intake",
  first_round: "first round",
  second_round: "second round",
};

const roundColors: Record<Rounds, string> = {
  intake: "bg-green-50 text-green-700 border-green-200",
  first_round: "bg-lime-50 text-lime-700 border-lime-200",
  second_round: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

interface RoundBadgeProps {
  round: Rounds;
}

export const RoundBadge = ({ round }: RoundBadgeProps) => (
  <Badge variant="outline" className={`inline-block ${roundColors[round]}`}>
    {`${roundLabels[round]}`}
  </Badge>
);
