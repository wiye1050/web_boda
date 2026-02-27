"use client";

import dynamic from "next/dynamic";

const WeddingChat = dynamic(
  () => import("@/components/WeddingChat").then((mod) => mod.WeddingChat),
  { ssr: false }
);

export function WeddingChatWrapper() {
  return <WeddingChat />;
}
