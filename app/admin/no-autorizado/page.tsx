export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold">Acceso restringido</h1>
      <p className="text-sm text-muted">
        Tu cuenta no está autorizada para ver el panel de administración. Si
        crees que se trata de un error, contacta con Alba o Guille para que
        verifiquen tu acceso.
      </p>
    </main>
  );
}
