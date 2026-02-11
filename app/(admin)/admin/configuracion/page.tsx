import Link from "next/link";

export default function ConfigPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-6 rounded-[32px] border border-border/70 bg-surface/50 p-10 shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          ⚙️
        </div>
        <h1 className="text-2xl font-bold">Configuración unificada</h1>
        <p className="text-muted-foreground">
          Hemos movido toda la configuración al panel de <strong>Secciones</strong> para que tengas todo en un solo lugar.
        </p>
        <Link
          href="/admin/secciones"
          className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/30"
        >
          Ir a Secciones
        </Link>
      </div>
    </div>
  );
}
