import { httpRouter } from "convex/server";
import { postCall } from "./webhook/post_call";

const http = httpRouter();

http.route({
  path: "/webhook",
  method: "POST",
  handler: postCall,
});

export default http;
