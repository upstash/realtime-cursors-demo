import { Realtime, InferRealtimeEvents } from "@upstash/realtime";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const redis = Redis.fromEnv();

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
});

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
