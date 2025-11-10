"use client";

import { useCursors } from "@/lib/use-cursors";
import { Cursor } from "@/components/Cursor";

export default function Home() {
  const { otherCursors, updateCursor, myId } = useCursors();

  const handleMouseMove = (e: React.MouseEvent) => {
    updateCursor(e.clientX, e.clientY);
  };

  return (
    <div
      className="relative h-screen w-screen bg-zinc-50 dark:bg-zinc-900"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-4 left-4 text-sm text-zinc-600 dark:text-zinc-400">
        You are: {myId || "..."}
      </div>

      {Object.values(otherCursors).map((cursor) => (
        <Cursor key={cursor.id} id={cursor.id} x={cursor.x} y={cursor.y} />
      ))}
    </div>
  );
}
