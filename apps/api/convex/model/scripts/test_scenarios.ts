// Test scenarios for queue implementation edge cases
import { v } from "convex/values";
import { internalMutation, MutationCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";

export default internalMutation({
  args: {
    scenario: v.union(
      v.literal("capacity_overflow"),
      v.literal("ui_backend_mismatch"),
      v.literal("wait_time_divergence"),
      v.literal("error_recovery"),
      v.literal("queue_fairness"),
      v.literal("concurrent_joins"),
      v.literal("orphaned_schedulers"),
      v.literal("all")
    ),
  },
  returns: v.null(),
  handler: async (ctx: MutationCtx, { scenario }) => {
    console.log(`Setting up test scenario: ${scenario}`);

    if (scenario === "capacity_overflow" || scenario === "all") {
      await setupCapacityOverflowScenario(ctx);
    }

    if (scenario === "ui_backend_mismatch" || scenario === "all") {
      await setupUIBackendMismatchScenario(ctx);
    }

    if (scenario === "wait_time_divergence" || scenario === "all") {
      await setupWaitTimeDivergenceScenario(ctx);
    }

    if (scenario === "error_recovery" || scenario === "all") {
      await setupErrorRecoveryScenario(ctx);
    }

    if (scenario === "queue_fairness" || scenario === "all") {
      await setupQueueFairnessScenario(ctx);
    }

    if (scenario === "concurrent_joins" || scenario === "all") {
      await setupConcurrentJoinsScenario(ctx);
    }

    if (scenario === "orphaned_schedulers" || scenario === "all") {
      await setupOrphanedSchedulersScenario(ctx);
    }

    console.log(`Test scenario setup complete: ${scenario}`);
    return null;
  },
});

// CRITICAL BUG TEST: Capacity overflow - multiple users bypassing MAX_CONCURRENT_CALLS
async function setupCapacityOverflowScenario(ctx: MutationCtx) {
  console.log("📊 Setting up CAPACITY OVERFLOW scenario...");

  // Create exactly 5 active calls (at capacity)
  const baseTime = Date.now();
  const activeSessions = [];

  for (let i = 0; i < 5; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `overflow-active-${i}`
    );

    // Make them active calls with staggered end times
    const scheduledEndTime = baseTime + 5 * 60 * 1000 + i * 30 * 1000; // End 5-7.5 minutes from now
    const sessionUrl = `https://test.com/session/overflow-${i}`;

    const endCallFnId = await ctx.scheduler.runAt(
      new Date(scheduledEndTime),
      internal.application.queue.scheduledLeave,
      { sessionId }
    );

    await ctx.db.patch(sessionId, {
      waiting: false,
      inCall: true,
      sessionUrl,
      scheduledEndTime,
      endCallFnId,
      queuedAt: baseTime - 10 * 60 * 1000, // Started queue 10 minutes ago
    });

    activeSessions.push(sessionId);
  }

  // Create 3 users waiting in queue
  const waitingSessions = [];
  for (let i = 0; i < 3; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `overflow-waiting-${i}`
    );

    await ctx.db.patch(sessionId, {
      waiting: true,
      inCall: false,
      queuedAt: baseTime + i * 1000, // Stagger by 1 second
    });

    waitingSessions.push(sessionId);
  }

  // Create 2 users ready to join (these should trigger the capacity overflow bug)
  const readyToJoinSessions = [];
  for (let i = 0; i < 2; i++) {
    const { sessionId } = await createTestApplicant(ctx, `overflow-ready-${i}`);
    readyToJoinSessions.push(sessionId);
  }

  console.log(
    `✅ CAPACITY OVERFLOW: Created 5 active, 3 waiting, 2 ready-to-join sessions`
  );
  console.log(
    `📋 Test: Call handleJoin on ready-to-join sessions simultaneously to trigger capacity overflow`
  );
  console.log(
    `🎯 Expected: Should queue new users, not exceed 5 concurrent calls`
  );
}

// HIGH BUG TEST: UI shows "join_call" while backend would queue
async function setupUIBackendMismatchScenario(ctx: MutationCtx) {
  console.log("🔄 Setting up UI/BACKEND MISMATCH scenario...");

  const baseTime = Date.now();

  // Create exactly 4 active calls (1 below capacity)
  for (let i = 0; i < 4; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `mismatch-active-${i}`
    );

    const scheduledEndTime = baseTime + 3 * 60 * 1000;
    const sessionUrl = `https://test.com/session/mismatch-${i}`;

    const endCallFnId = await ctx.scheduler.runAt(
      new Date(scheduledEndTime),
      internal.application.queue.scheduledLeave,
      { sessionId }
    );

    await ctx.db.patch(sessionId, {
      waiting: false,
      inCall: true,
      sessionUrl,
      scheduledEndTime,
      endCallFnId,
    });
  }

  // Create 2 users waiting in queue (this creates the mismatch condition)
  for (let i = 0; i < 2; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `mismatch-waiting-${i}`
    );

    await ctx.db.patch(sessionId, {
      waiting: true,
      inCall: false,
      queuedAt: baseTime + i * 1000,
    });
  }

  // Create 1 test user to check status
  const { sessionId: testSessionId } = await createTestApplicant(
    ctx,
    `mismatch-test-user`
  );

  console.log(
    `✅ UI/BACKEND MISMATCH: Created 4 active, 2 waiting, 1 test user`
  );
  console.log(`📋 Test: Check getSessionStatus for test user`);
  console.log(`🎯 Expected: Should show "join_queue" (fixed), not "join_call"`);
}

// MEDIUM BUG TEST: Wait time calculation divergence
async function setupWaitTimeDivergenceScenario(ctx: MutationCtx) {
  console.log("⏱️ Setting up WAIT TIME DIVERGENCE scenario...");

  const baseTime = Date.now();

  // Create 5 active calls with specific end times to test MinHeap calculation
  const endTimes = [
    baseTime + 2 * 60 * 1000, // 2 minutes
    baseTime + 4 * 60 * 1000, // 4 minutes
    baseTime + 6 * 60 * 1000, // 6 minutes
    baseTime + 8 * 60 * 1000, // 8 minutes
    baseTime + 10 * 60 * 1000, // 10 minutes
  ];

  for (let i = 0; i < 5; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `waittime-active-${i}`
    );

    const endCallFnId = await ctx.scheduler.runAt(
      new Date(endTimes[i]),
      internal.application.queue.scheduledLeave,
      { sessionId }
    );

    await ctx.db.patch(sessionId, {
      waiting: false,
      inCall: true,
      sessionUrl: `https://test.com/session/waittime-${i}`,
      scheduledEndTime: endTimes[i],
      endCallFnId,
    });
  }

  // Create 8 waiting users to test wait time calculations
  for (let i = 0; i < 8; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `waittime-waiting-${i}`
    );

    await ctx.db.patch(sessionId, {
      waiting: true,
      inCall: false,
      queuedAt: baseTime + i * 2000, // Stagger by 2 seconds
    });
  }

  console.log(
    `✅ WAIT TIME DIVERGENCE: Created 5 active (staggered end times), 8 waiting`
  );
  console.log(
    `📋 Test: Compare getSessionWaitTime vs actual queue processing order`
  );
  console.log(
    `🎯 Expected: Wait times should accurately reflect MinHeap simulation`
  );
}

// ERROR RECOVERY TEST: Test error handling in various scenarios
async function setupErrorRecoveryScenario(ctx: MutationCtx) {
  console.log("🚨 Setting up ERROR RECOVERY scenario...");

  const baseTime = Date.now();

  // Create 3 active calls
  for (let i = 0; i < 3; i++) {
    const { sessionId } = await createTestApplicant(ctx, `error-active-${i}`);

    const scheduledEndTime = baseTime + 3 * 60 * 1000;
    const endCallFnId = await ctx.scheduler.runAt(
      new Date(scheduledEndTime),
      internal.application.queue.scheduledLeave,
      { sessionId }
    );

    await ctx.db.patch(sessionId, {
      waiting: false,
      inCall: true,
      sessionUrl: `https://test.com/session/error-${i}`,
      scheduledEndTime,
      endCallFnId,
    });
  }

  // Create users in queue for error testing
  for (let i = 0; i < 4; i++) {
    const { sessionId } = await createTestApplicant(ctx, `error-waiting-${i}`);

    await ctx.db.patch(sessionId, {
      waiting: true,
      inCall: false,
      queuedAt: baseTime + i * 1000,
    });
  }

  console.log(`✅ ERROR RECOVERY: Created 3 active, 4 waiting sessions`);
  console.log(
    `📋 Test: Manually cause errors in joinCall/startNextCall to test recovery`
  );
  console.log(
    `🎯 Expected: Queue should continue processing despite individual failures`
  );
}

// QUEUE FAIRNESS TEST: Test FIFO ordering and fairness
async function setupQueueFairnessScenario(ctx: MutationCtx) {
  console.log("⚖️ Setting up QUEUE FAIRNESS scenario...");

  const baseTime = Date.now();

  // Create 5 active calls that will end at different times
  for (let i = 0; i < 5; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `fairness-active-${i}`
    );

    const scheduledEndTime = baseTime + 2 * 60 * 1000 + i * 15 * 1000; // End 2-3 minutes from now
    const endCallFnId = await ctx.scheduler.runAt(
      new Date(scheduledEndTime),
      internal.application.queue.scheduledLeave,
      { sessionId }
    );

    await ctx.db.patch(sessionId, {
      waiting: false,
      inCall: true,
      sessionUrl: `https://test.com/session/fairness-${i}`,
      scheduledEndTime,
      endCallFnId,
    });
  }

  // Create 6 waiting users with intentionally close timestamps to test ordering
  const queueTimes = [
    baseTime - 5 * 60 * 1000, // 5 minutes ago (first in queue)
    baseTime - 4 * 60 * 1000 + 100, // 4 min ago + 100ms
    baseTime - 4 * 60 * 1000 + 200, // 4 min ago + 200ms
    baseTime - 3 * 60 * 1000, // 3 minutes ago
    baseTime - 2 * 60 * 1000, // 2 minutes ago
    baseTime - 1 * 60 * 1000, // 1 minute ago (last in queue)
  ];

  for (let i = 0; i < 6; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `fairness-waiting-${i}`
    );

    await ctx.db.patch(sessionId, {
      waiting: true,
      inCall: false,
      queuedAt: queueTimes[i],
    });
  }

  console.log(
    `✅ QUEUE FAIRNESS: Created 5 active, 6 waiting (with precise queue times)`
  );
  console.log(`📋 Test: Monitor queue processing order when calls end`);
  console.log(
    `🎯 Expected: Queue should process in exact FIFO order based on queuedAt`
  );
}

// CONCURRENCY TEST: Test concurrent handleJoin calls
async function setupConcurrentJoinsScenario(ctx: MutationCtx) {
  console.log("🏃‍♂️ Setting up CONCURRENT JOINS scenario...");

  // Create exactly 4 active calls (1 below capacity)
  const baseTime = Date.now();

  for (let i = 0; i < 4; i++) {
    const { sessionId } = await createTestApplicant(
      ctx,
      `concurrent-active-${i}`
    );

    const scheduledEndTime = baseTime + 4 * 60 * 1000;
    const endCallFnId = await ctx.scheduler.runAt(
      new Date(scheduledEndTime),
      internal.application.queue.scheduledLeave,
      { sessionId }
    );

    await ctx.db.patch(sessionId, {
      waiting: false,
      inCall: true,
      sessionUrl: `https://test.com/session/concurrent-${i}`,
      scheduledEndTime,
      endCallFnId,
    });
  }

  // Create 5 users ready for concurrent join attempts
  for (let i = 0; i < 5; i++) {
    await createTestApplicant(ctx, `concurrent-ready-${i}`);
  }

  console.log(
    `✅ CONCURRENT JOINS: Created 4 active, 5 ready-to-join sessions`
  );
  console.log(
    `📋 Test: Call handleJoin on all 5 ready sessions simultaneously`
  );
  console.log(`🎯 Expected: Only 1 should join call, 4 should be queued`);
}

// ORPHANED SCHEDULERS TEST: Test scheduler cleanup
async function setupOrphanedSchedulersScenario(ctx: MutationCtx) {
  console.log("👻 Setting up ORPHANED SCHEDULERS scenario...");

  const baseTime = Date.now();

  // Create 3 sessions that will be used to test scheduler cleanup
  for (let i = 0; i < 3; i++) {
    const { sessionId } = await createTestApplicant(ctx, `orphan-test-${i}`);

    // These sessions are ready for testing partial failure scenarios
    console.log(`Created test session for orphan testing: orphan-test-${i}`);
  }

  // Create 2 active calls for context
  for (let i = 0; i < 2; i++) {
    const { sessionId } = await createTestApplicant(ctx, `orphan-active-${i}`);

    const scheduledEndTime = baseTime + 3 * 60 * 1000;
    const endCallFnId = await ctx.scheduler.runAt(
      new Date(scheduledEndTime),
      internal.application.queue.scheduledLeave,
      { sessionId }
    );

    await ctx.db.patch(sessionId, {
      waiting: false,
      inCall: true,
      sessionUrl: `https://test.com/session/orphan-${i}`,
      scheduledEndTime,
      endCallFnId,
    });
  }

  console.log(`✅ ORPHANED SCHEDULERS: Created 2 active, 3 test sessions`);
  console.log(
    `📋 Test: Manually trigger joinCall failures to test scheduler cleanup`
  );
  console.log(
    `🎯 Expected: Failed joinCall should clean up scheduled functions`
  );
}

// Helper function to create test applicants
async function createTestApplicant(ctx: MutationCtx, prefix: string) {
  // Create basic info
  const basicInfoId = await ctx.db.insert("basicInfo", {
    firstName: `${prefix}-First`,
    lastName: `${prefix}-Last`,
    email: `${prefix}@test.com`,
    phoneNumber: `555-0000`,
  });

  // Create mission
  const missionId = await ctx.db.insert("missions", {
    interest: `Test interest for ${prefix}`,
    accomplishment: `Test accomplishment for ${prefix}`,
  });

  // Create background
  const backgroundId = await ctx.db.insert("backgrounds", {
    gender: "Test",
    country: "TestCountry",
  });

  // Create links
  const linkId = await ctx.db.insert("links", {
    website: `https://${prefix}.test.com`,
  });

  // Create applicant
  const applicantId = await ctx.db.insert("applicants", {
    cohort: "SUMMER_2025",
    status: "pending",
    round: "first_round",
    ranking: "neutral",
    basicInfoId,
    missionId,
    backgroundId,
    linkId,
  });

  // Create session
  const sessionId = await ctx.db.insert("sessions", {
    waiting: false,
    inCall: false,
    applicantId,
    missionId,
  });

  // Create persona
  await ctx.db.insert("personas", {
    sessionId,
    role: `${prefix} Role`,
    tagline: `${prefix} tagline`,
  });

  return {
    applicantId,
    sessionId,
    basicInfoId,
    missionId,
    backgroundId,
    linkId,
  };
}
