import { internalMutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import schema from "../schema";
import { Id } from "../_generated/dataModel";

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
    console.log("Starting database reset...");

    // Cancel all scheduled functions by querying the system table
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
          // console.log(`Successfully cancelled job ${job._id}`); // Optional: very verbose
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
        // Log details of failed cancellations if needed
        // console.warn("Failed job details:", failedCancellations);
      } else {
        console.log("All found scheduled jobs processed for cancellation.");
      }
    } else {
      console.log("No scheduled jobs found to cancel.");
    }

    // Delete all documents from each table
    for (const tableName of tableNames) {
      console.log(`Clearing table: ${tableName}...`);
      // Get all documents in the table
      const documents = await ctx.db.query(tableName).collect();

      if (documents.length === 0) {
        console.log(`Table ${tableName} is already empty.`);
        continue;
      }

      // Delete each document individually
      // Note: Convex doesn't have a bulk delete, so we iterate.
      await Promise.all(documents.map((doc) => ctx.db.delete(doc._id)));
      console.log(`Cleared ${documents.length} documents from ${tableName}.`);
    }

    console.log("Database reset complete.");
    return null;
  },
});
