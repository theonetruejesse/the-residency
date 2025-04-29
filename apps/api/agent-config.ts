// import { elevenClient } from "./constants";

// // todo, later
// export async function createAgent() {
//   try {
//     const agent = await elevenClient.conversationalAi.createAgent({
//       conversation_config: {
//         agent: {
//           first_message: "Hi. I'm an authenticated agent.",
//         },
//       },
//       platform_settings: {
//         auth: {
//           enable_auth: false,
//           allowlist: [
//             { hostname: "example.com" },
//             { hostname: "app.example.com" },
//             { hostname: "localhost:3000" },
//           ],
//         },
//       },
//     });

//     return agent;
//   } catch (error) {
//     console.error("Error creating agent:", error);
//     throw error;
//   }
// }
