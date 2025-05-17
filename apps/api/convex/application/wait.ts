import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalQuery } from "../_generated/server";
import { MAX_CONCURRENT_CALLS, MAX_SESSION_DURATION } from "../constants";
import { Doc, Id } from "../_generated/dataModel";

// --- Main Query Function ---

export const getSessionWaitTime = internalQuery({
  args: { sessionId: v.id("sessions") },
  returns: v.number(),
  handler: async (ctx, { sessionId }): Promise<number> => {
    // 1. Initial checks
    const targetSession = await ctx.db.get(sessionId);
    if (!targetSession) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (targetSession.inCall) return 0; // Already in a call

    // 2. Fetch current state
    const inCalls: Doc<"sessions">[] = await ctx.runQuery(
      internal.application.queue.listActiveCalls
    );
    if (inCalls.length < MAX_CONCURRENT_CALLS) return 0; // Slots available

    const waiting: Doc<"sessions">[] = await ctx.runQuery(
      internal.application.queue.listWaitingSessions
    );

    // 3. Initialize heap
    const now = Date.now();
    const minHeap = initializeAvailabilityHeap(inCalls, now);

    // 4. Simulate based on whether target session is already waiting
    const targetInWaitingList = waiting.some(
      (session) => session._id === sessionId
    );

    if (targetSession.waiting && targetInWaitingList) {
      return simulateQueueForExistingSession(waiting, sessionId, minHeap, now);
    } else {
      // Calculate wait time as if joining the queue now
      return simulateQueueForNewSession(waiting, minHeap, now);
    }
  },
});

// --- Helper Functions ---

/** Initializes the MinHeap with current server availability times. */
function initializeAvailabilityHeap(
  inCalls: Doc<"sessions">[],
  now: number
): MinHeap {
  const minHeap = new MinHeap();
  // Add end times for current calls
  for (const call of inCalls) {
    const endTime = call.scheduledEndTime || now;
    minHeap.push(endTime);
  }
  // Fill heap with current time for any remaining idle slots
  while (minHeap.size() < MAX_CONCURRENT_CALLS) {
    minHeap.push(now);
  }
  return minHeap;
}

/** Simulates the queue to find wait time for a session already waiting. */
function simulateQueueForExistingSession(
  waiting: Doc<"sessions">[],
  targetSessionId: Id<"sessions">,
  minHeap: MinHeap,
  now: number
): number {
  for (const session of waiting) {
    const earliestAvailableTime = minHeap.pop();
    if (earliestAvailableTime === undefined) {
      throw new Error(
        "Heap error: minHeap unexpectedly empty during existing session simulation"
      );
    }

    if (session._id === targetSessionId) {
      const waitMs = Math.max(0, earliestAvailableTime - now);
      return Math.ceil(waitMs / (60 * 1000)); // Wait time in minutes
    }

    // Add this session's projected end time back to the heap
    const sessionEndTime = earliestAvailableTime + MAX_SESSION_DURATION;
    minHeap.push(sessionEndTime);
  }
  // Should be unreachable if targetSessionId is verified to be in 'waiting'
  throw new Error(
    `Logic error: Target session ${targetSessionId} not found during simulation`
  );
}

/** Simulates the queue to find wait time for a session joining now. */
function simulateQueueForNewSession(
  waiting: Doc<"sessions">[],
  minHeap: MinHeap,
  now: number
): number {
  // Process all currently waiting sessions first
  for (const _session of waiting) {
    const earliestAvailableTime = minHeap.pop();
    if (earliestAvailableTime === undefined) {
      throw new Error(
        "Heap error: minHeap unexpectedly empty during new session simulation"
      );
    }
    const sessionEndTime = earliestAvailableTime + MAX_SESSION_DURATION;
    minHeap.push(sessionEndTime);
  }

  // Now determine the wait time for the new session joining at the end
  const earliestAvailableTime = minHeap.pop();
  if (earliestAvailableTime === undefined) {
    throw new Error(
      "Heap error: minHeap unexpectedly empty calculating final wait time"
    );
  }
  const waitMs = Math.max(0, earliestAvailableTime - now);
  return Math.ceil(waitMs / (60 * 1000)); // Wait time in minutes
}

// --- MinHeap Class ---

class MinHeap {
  private heap: number[];

  constructor() {
    this.heap = [];
  }

  // Get parent index
  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  // Get left child index
  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  // Get right child index
  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
  }

  // Swap elements at two indices
  private swap(index1: number, index2: number): void {
    [this.heap[index1]!, this.heap[index2]!] = [
      this.heap[index2]!,
      this.heap[index1]!,
    ];
  }

  // Heapify up after insertion
  private heapifyUp(index: number): void {
    if (index === 0) return;

    const parentIndex = this.getParentIndex(index);
    if (this.heap[parentIndex]! > this.heap[index]!) {
      this.swap(parentIndex, index);
      this.heapifyUp(parentIndex);
    }
  }

  // Heapify down after extraction
  private heapifyDown(index: number): void {
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);
    let smallest = index;

    if (
      leftChildIndex < this.heap.length &&
      this.heap[leftChildIndex]! < this.heap[smallest]!
    ) {
      smallest = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.heap[rightChildIndex]! < this.heap[smallest]!
    ) {
      smallest = rightChildIndex;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  // Push a value onto the heap
  push(value: number): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  // Pop the minimum value from the heap
  pop(): number | undefined {
    if (this.heap.length === 0) return undefined;

    const min = this.heap[0];
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown(0);
    }

    return min;
  }

  // Peek at the minimum value without removing it
  peek(): number | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined;
  }

  // Get the size of the heap
  size(): number {
    return this.heap.length;
  }
}
