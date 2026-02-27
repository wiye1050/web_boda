"use client";

import dynamic from "next/dynamic";

const EnvelopeIntro = dynamic(
  () => import("@/components/EnvelopeIntro").then((m) => m.EnvelopeIntro),
  { ssr: false }
);

export function EnvelopeWrapper() {
  return <EnvelopeIntro />;
}
