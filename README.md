# Realtime Cursors Demo

See everyone's cursor position in real-time using Upstash Realtime.

## How It Works

**1. Event schema is defined with zod**

```ts
// lib/realtime.ts
const schema = {
  update: z.object({
    id: z.string(),
    positions: z.array(
      z.object({ x: z.number(), y: z.number(), t: z.number() })
    ),
  }),
};

export const realtime = new Realtime({ schema, redis: Redis.fromEnv() });
```

**2. Mouse moves → movements are recorded in batches of 500ms → POST to `/api/cursor`**

```ts
// lib/use-cursors.ts
const updateCursor = (x: number, y: number) => {
  pendingPositions.current.push({ x, y, t: offset });
};

setInterval(() => {
  fetch("/api/cursor", {
    method: "POST",
    body: JSON.stringify({
      id: myId.current,
      positions: pendingPositions.current,
    }),
  });
}, 500);
```

**3. Server emits to Upstash Realtime channel → adds an entry to the redis stream**

```ts
// /api/cursor (app/api/cursor/route.ts)
export async function POST(request: NextRequest) {
  const body = await request.json();
  await realtime.emit("update", body);
}
```

**4. All clients receive updates via the open SSE channels → replay the recorded cursor positions**

```ts
// lib/use-cursors.ts
useRealtime<RealtimeEvents>({
  event: "update",
  onData(data) {
    // Replay the recorded movements
  },
});
```

## Setup

```bash
# Install
npm install

# Add to .env
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token

# Run
npm run dev
```

Open http://localhost:3000 in multiple tabs.

## Structure

```
lib/use-cursors.ts    # Hook: batching, interpolation, state
lib/realtime.ts       # Upstash config + schema
app/api/cursor/       # POST endpoint to emit updates
app/api/realtime/     # WebSocket handler
components/Cursor.tsx # SVG pointer + name tag
```
