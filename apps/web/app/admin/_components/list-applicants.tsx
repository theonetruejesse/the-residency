"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@residency/ui/components/accordion";
import { Button } from "@residency/ui/components/button";
import { Card, CardContent } from "@residency/ui/components/card";
import { Badge } from "@residency/ui/components/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@residency/ui/components/select";
import { ChevronRight, Twitter, Linkedin, Github, Globe } from "lucide-react";
import { useState } from "react";
import { api } from "@residency/api";
import { usePaginatedQuery, useAction } from "convex/react";
import { Id } from "@residency/api/convex/_generated/dataModel";

// Type definitions to match our backend schema
interface Applicant {
  id: string;
  decision: {
    status: "pending" | "waitlisted" | "accepted" | "rejected";
    round: "intake" | "first_round" | "second_round";
    ranking:
      | "likely_reject"
      | "maybe_reject"
      | "neutral"
      | "maybe_accept"
      | "likely_accept";
  };
  basicInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  mission: {
    interest: string;
    accomplishment: string;
  };
  background: {
    gender: string;
    country: string;
    college?: string;
    referrals?: string;
  };
  links: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export const ApplicantList = () => {
  const [paginationOpts, setPaginationOpts] = useState({
    numItems: 10,
    cursor: null,
  });

  const { results, status, loadMore } = usePaginatedQuery(
    api.application.admin.listApplicants,
    { paginationOpts },
    { initialNumItems: 10 }
  );

  if (status === "LoadingFirstPage") {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="applicants">
          <AccordionTrigger className="text-xl font-semibold">
            Applicants Summer 2025
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="w-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-[180px] bg-gray-200 animate-pulse rounded" />
                          <div className="h-10 w-10 bg-gray-200 animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="applicants">
        <AccordionTrigger className="text-xl font-semibold">
          Applicants Summer 2025
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {results?.page?.map((applicant: any) => (
              <ApplicantCard key={applicant.id} applicant={applicant} />
            ))}
            {status !== "Exhausted" && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => loadMore(10)}
                  disabled={status === "LoadingMore"}
                >
                  {status === "LoadingMore" ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

type ApplicantCardProps = {
  applicant: Applicant;
};

type Decision = "approve" | "waitlist" | "reject";

const ApplicantCard = ({ applicant }: ApplicantCardProps) => {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [decision, setDecision] = useState<Decision>("approve");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approveIntake = useAction(api.application.admin.approveIntake);
  const waitlistApplicant = useAction(api.application.admin.waitlistApplicant);
  const rejectApplicant = useAction(api.application.admin.rejectApplicant);

  const toggleInfo = () => {
    setIsInfoExpanded(!isInfoExpanded);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      switch (decision) {
        case "approve":
          await approveIntake({
            applicantId: applicant.id as unknown as Id<"applicants">,
          });
          break;
        case "waitlist":
          await waitlistApplicant({
            applicantId: applicant.id as unknown as Id<"applicants">,
          });
          break;
        case "reject":
          await rejectApplicant({
            applicantId: applicant.id as unknown as Id<"applicants">,
          });
          break;
      }
    } catch (error) {
      console.error("Error updating applicant status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header section with name, referral, select and button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {applicant.basicInfo.firstName} {applicant.basicInfo.lastName}
              </h3>
              <Badge
                variant="outline"
                className={
                  applicant.decision.status === "pending"
                    ? "bg-yellow-100"
                    : applicant.decision.status === "accepted"
                      ? "bg-green-100"
                      : applicant.decision.status === "rejected"
                        ? "bg-red-100"
                        : "bg-blue-100"
                }
              >
                {applicant.decision.status}
              </Badge>
              <Badge variant="outline" className="bg-slate-100">
                {applicant.decision.round}
              </Badge>
              {applicant.background.referrals && (
                <Badge variant="outline" className="bg-slate-100">
                  Referred by: {applicant.background.referrals}
                </Badge>
              )}
            </div>

            {/* Decision section moved to header */}
            <div className="flex items-center gap-2">
              <Select
                defaultValue="approve"
                onValueChange={(value) => setDecision(value as Decision)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="waitlist">Waitlist</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSubmit}
                size="icon"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Collapsible info section */}
          <div className="border-t border-b py-2">
            <button
              onClick={toggleInfo}
              className="flex items-center text-sm text-muted-foreground w-full"
            >
              <span className="mr-1">{isInfoExpanded ? "[-]" : "[+]"}</span>
              {isInfoExpanded ? (
                <span>
                  Email: {applicant.basicInfo.email}, Phone:{" "}
                  {applicant.basicInfo.phoneNumber}, Gender:{" "}
                  {applicant.background.gender}, Country:{" "}
                  {applicant.background.country}
                  {applicant.background.college &&
                    `, College: ${applicant.background.college}`}
                </span>
              ) : (
                "Show details"
              )}
            </button>
          </div>

          {/* Mission section */}
          <div className="space-y-2">
            <div>
              <span className="font-bold">Interests: </span>
              <span>{applicant.mission.interest}</span>
            </div>
            <div>
              <span className="font-bold">Accomplishments: </span>
              <span>{applicant.mission.accomplishment}</span>
            </div>
          </div>

          {/* Links section */}
          <div className="flex items-center gap-3">
            {applicant.links.twitter && (
              <a
                href={applicant.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {applicant.links.linkedin && (
              <a
                href={applicant.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {applicant.links.github && (
              <a
                href={applicant.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {applicant.links.website && (
              <a
                href={applicant.links.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
