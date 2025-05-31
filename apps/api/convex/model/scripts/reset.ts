import { internalMutation, type MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import schema from "../../schema";
import { Id } from "../../_generated/dataModel";

const tableNames = Object.keys(schema.tables) as (keyof typeof schema.tables)[];

// Define a basic type for the scheduled function document
type ScheduledFunctionDoc = {
  _id: Id<"_scheduled_functions">;
  // Include other known properties if necessary, or leave as is for basic ID access
  [key: string]: any; // Allow other properties
};

export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx: MutationCtx) => {
    console.log(
      "Starting selective database reset (preserving admin users)..."
    );

    // Step 1: Identify admin users to preserve (those with clerkId)
    const adminUsers = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("clerkId"), undefined))
      .collect();

    console.log(`Found ${adminUsers.length} admin users to preserve`);

    // Collect IDs of data to preserve
    const preserveIds = {
      users: new Set<Id<"users">>(),
      basicInfo: new Set<Id<"basicInfo">>(),
      missions: new Set<Id<"missions">>(),
      backgrounds: new Set<Id<"backgrounds">>(),
      links: new Set<Id<"links">>(),
    };

    // Add admin user data to preserve list
    for (const user of adminUsers) {
      preserveIds.users.add(user._id);
      if (user.basicInfoId) preserveIds.basicInfo.add(user.basicInfoId);
      if (user.missionId) preserveIds.missions.add(user.missionId);
      if (user.backgroundId) preserveIds.backgrounds.add(user.backgroundId);
      if (user.linkId) preserveIds.links.add(user.linkId);
    }

    console.log(
      `Preserving: ${preserveIds.users.size} users, ${preserveIds.basicInfo.size} basicInfo, ${preserveIds.missions.size} missions, ${preserveIds.backgrounds.size} backgrounds, ${preserveIds.links.size} links`
    );

    // Step 2: Cancel all scheduled functions by querying the system table
    let scheduledJobs: ScheduledFunctionDoc[] = [];
    try {
      scheduledJobs = await ctx.db.system
        .query("_scheduled_functions")
        .collect();
    } catch (e) {
      console.error("Error querying _scheduled_functions:", e);
      scheduledJobs = [];
    }

    if (scheduledJobs.length > 0) {
      console.log(`Found ${scheduledJobs.length} scheduled jobs to cancel...`);
      const cancellationPromises = scheduledJobs.map(async (job) => {
        try {
          await ctx.scheduler.cancel(job._id);
          return { id: job._id, status: "cancelled" };
        } catch (error) {
          console.error(`Failed to cancel job ${job._id}:`, error);
          return { id: job._id, status: "failed", error: error };
        }
      });

      const results = await Promise.all(cancellationPromises);
      const failedCancellations = results.filter((r) => r.status === "failed");

      if (failedCancellations.length > 0) {
        console.warn(`Failed to cancel ${failedCancellations.length} jobs.`);
      } else {
        console.log("All found scheduled jobs processed for cancellation.");
      }
    } else {
      console.log("No scheduled jobs found to cancel.");
    }

    // Step 3: Selectively delete documents from each table
    for (const tableName of tableNames) {
      console.log(`Clearing table: ${tableName}...`);

      // Get all documents in the table
      const documents = await ctx.db.query(tableName).collect();

      if (documents.length === 0) {
        console.log(`Table ${tableName} is already empty.`);
        continue;
      }

      let deletedCount = 0;
      let preservedCount = 0;

      // Delete documents selectively based on table
      for (const doc of documents) {
        let shouldPreserve = false;

        // Check if this document should be preserved
        switch (tableName) {
          case "users":
            shouldPreserve = preserveIds.users.has(doc._id as Id<"users">);
            break;
          case "basicInfo":
            shouldPreserve = preserveIds.basicInfo.has(
              doc._id as Id<"basicInfo">
            );
            break;
          case "missions":
            shouldPreserve = preserveIds.missions.has(
              doc._id as Id<"missions">
            );
            break;
          case "backgrounds":
            shouldPreserve = preserveIds.backgrounds.has(
              doc._id as Id<"backgrounds">
            );
            break;
          case "links":
            shouldPreserve = preserveIds.links.has(doc._id as Id<"links">);
            break;
          default:
            // Delete everything else (applicants, sessions, personas, interviews, grades, notes)
            shouldPreserve = false;
        }

        if (shouldPreserve) {
          preservedCount++;
        } else {
          await ctx.db.delete(doc._id);
          deletedCount++;
        }
      }

      console.log(
        `Table ${tableName}: deleted ${deletedCount}, preserved ${preservedCount}`
      );
    }

    console.log(
      "Selective database reset complete - admin users and their data preserved."
    );
    return null;
  },
});
