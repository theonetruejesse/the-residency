import { internalMutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import schema from "../schema";

const tableNames = Object.keys(schema.tables) as (keyof typeof schema.tables)[];

export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx: MutationCtx) => {
    console.log("Starting database reset...");

    // Cancel all scheduled functions by querying the system table
    const scheduledJobs = await ctx.db.system
      .query("_scheduled_functions")
      .collect();
    if (scheduledJobs.length > 0) {
      console.log(`Cancelling ${scheduledJobs.length} scheduled jobs...`);
      await Promise.all(
        scheduledJobs.map((job) => ctx.scheduler.cancel(job._id))
      );
      console.log("Scheduled jobs cancelled.");
    } else {
      console.log("No scheduled jobs to cancel.");
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
