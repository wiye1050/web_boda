import type { Metadata } from "next";
import { AuthProvider } from "@/components/admin/AuthContext";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Panel de administración | Alba & Guille",
  description:
    "Gestiona invitados, RSVPs y logística del evento desde el panel privado de Alba y Guille.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <AdminShell>{children}</AdminShell>
      </AuthGuard>
    </AuthProvider>
  );
}
