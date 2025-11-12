"use client";

import { useRealtime } from "@upstash/realtime/client";
import type { RealtimeEvents } from "@/lib/realtime";
import { generateUsername } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

type Cursor = {
  id: string;
  x: number;
  y: number;
  lastSeen: number;
};

const BATCHING_TIME = 500;

export function useCursors() {
  const myId = useRef("");
  const [otherCursors, setOtherCursors] = useState<Record<string, Cursor>>({});
  const pendingPositions = useRef<{ x: number; y: number; t: number }[]>([]);
  const batchStartTime = useRef<number>(0);

  useEffect(() => {
    if (!myId.current) myId.current = generateUsername();
  }, []);

  // Listen for cursor updates
  useRealtime<RealtimeEvents>({
    event: "update",
    onData(data) {
      if (data.id === myId.current || data.positions.length === 0) return;

      // Replay the recording
      const startTime = performance.now();
      const totalDuration = data.positions[data.positions.length - 1].t;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;

        // Find the right position to show based on elapsed time
        let targetIndex = 0;
        for (let i = 0; i < data.positions.length; i++) {
          if (data.positions[i].t <= elapsed) {
            targetIndex = i;
          } else {
            break;
          }
        }

        const pos = data.positions[targetIndex];
        setOtherCursors((prev) => ({
          ...prev,
          [data.id]: {
            id: data.id,
            x: pos.x,
            y: pos.y,
            lastSeen: Date.now(),
          },
        }));

        if (elapsed < totalDuration) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    },
  });

  // Batch and send cursor updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingPositions.current.length === 0) return;

      fetch("/api/cursor", {
        method: "POST",
        body: JSON.stringify({
          id: myId.current,
          positions: pendingPositions.current,
        }),
      });
      pendingPositions.current = [];
      batchStartTime.current = 0;
    }, BATCHING_TIME);

    return () => clearInterval(interval);
  }, []);

  // Clean up stale cursors every 2 seconds
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setOtherCursors((prev) => {
        const updated = { ...prev };
        for (const id in updated) {
          if (now - updated[id].lastSeen > 10000) {
            delete updated[id];
          }
        }
        return updated;
      });
    }, 2000);

    return () => clearInterval(cleanup);
  }, []);

  const updateCursor = (x: number, y: number) => {
    const now = Date.now();

    if (batchStartTime.current === 0) {
      batchStartTime.current = now;
    }

    const offset = now - batchStartTime.current;
    pendingPositions.current.push({ x, y, t: offset });
  };

  // eslint-disable-next-line react-hooks/refs
  return { otherCursors, updateCursor, myId: myId.current };
}
