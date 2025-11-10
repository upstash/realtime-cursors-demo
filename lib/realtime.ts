import { Realtime, InferRealtimeEvents } from "@upstash/realtime";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const schema = {
  update: z.object({
    id: z.string(),
    positions: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        t: z.number(), // timestamp offset in ms
      })
    ),
  }),
};

export const realtime = new Realtime({
  schema,
  redis,
  // verbose: true,
});

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
