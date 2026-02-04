import { SeatingPlan } from "@/components/admin/SeatingPlan";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Organizador de Mesas",
};

export default function SeatingPage() {
  return <SeatingPlan />;
}
