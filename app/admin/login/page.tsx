import { Suspense } from "react";
import { AuthProvider } from "@/components/admin/AuthContext";
import { LoginScreen } from "@/components/admin/LoginScreen";

export const metadata = {
  title: "Acceso privado | Alba & Guille",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <AuthProvider>
          <Suspense fallback={<div className="h-24" />}>
            <LoginScreen />
          </Suspense>
        </AuthProvider>
      </div>
    </main>
  );
}
