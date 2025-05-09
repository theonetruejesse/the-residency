// import { clerkClient } from "./constants";
// import { v } from "convex/values";
// import { action } from "./_generated/server";

// // all clerk functions need to be actions (compatiblity issues)

// // todo, clerk wrapper for auth
// export const isAdmin = action({
//   args: {},
//   returns: v.boolean(),
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) return false;

//     const user = await clerkClient.users.getUser(identity.subject);
//     console.log(user);
//     return user.publicMetadata.admin;
//   },
// });

// export const isAuthenticated = action({
//   args: {},
//   returns: v.boolean(),
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     return !!identity;
//   },
// });
