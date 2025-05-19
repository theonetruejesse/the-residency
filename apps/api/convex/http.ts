import { httpRouter } from "convex/server";
import { gradeInterview } from "./webhook/grade_interview";
import { handleClerkWebhook } from "./webhook/handle_clerk";

const http = httpRouter();

http.route({
  path: "/grade-interview",
  method: "POST",
  handler: gradeInterview,
});

http.route({
  path: "/sync-clerk",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
