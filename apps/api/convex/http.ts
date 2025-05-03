import { httpRouter } from "convex/server";
import { helloWorld } from "./webhook/hello";

const http = httpRouter();

http.route({
  path: "/hello",
  method: "GET",
  handler: helloWorld,
});

export default http;
