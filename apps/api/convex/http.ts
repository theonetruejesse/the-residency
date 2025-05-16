import { httpRouter } from "convex/server";
import { gradeInterview } from "./webhook/grade_interview";

const http = httpRouter();

http.route({
  path: "/grade_interview",
  method: "POST",
  handler: gradeInterview,
});

// http.route({
//   path: "/sync_clerk",
//   method: "POST",
//   handler: syncClerkUsers,
// });

export default http;
