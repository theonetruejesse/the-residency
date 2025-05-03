import { httpAction } from "../_generated/server";

export const helloWorld = httpAction(async (ctx, request) => {
  console.log("helloWorld");
  return new Response("Hello World!", {
    status: 200,
  });
});
