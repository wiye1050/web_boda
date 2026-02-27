"use client";

import dynamic from "next/dynamic";

const AmbientMusic = dynamic(
  () => import("@/components/AmbientMusic").then((m) => m.AmbientMusic),
  { ssr: false }
);

export function MusicWrapper() {
  return <AmbientMusic />;
}
