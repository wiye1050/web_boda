"use client";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Bar Skeleton */}
      <div className="fixed top-0 z-50 w-full border-b border-border/10 bg-surface/40 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted/20" />
          <div className="hidden space-x-8 md:flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-16 animate-pulse rounded-md bg-muted/20" />
            ))}
          </div>
          <div className="h-10 w-28 animate-pulse rounded-full bg-primary/20" />
        </div>
      </div>

      <main className="flex-1 pt-16">
        {/* Hero Skeleton */}
        <div className="relative h-[80vh] w-full overflow-hidden bg-muted/5">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted/30" />
            <div className="mt-6 h-12 w-3/4 animate-pulse rounded-md bg-muted/20 sm:w-1/2" />
            <div className="mt-4 h-6 w-2/3 animate-pulse rounded-md bg-muted/20 sm:w-1/3" />
            <div className="mt-10 h-12 w-48 animate-pulse rounded-full bg-primary/20" />
          </div>
          {/* Decorative elements */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2 w-2 animate-pulse rounded-full bg-muted/30" />
            ))}
          </div>
        </div>

        {/* Section Skeleton */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-4 w-20 animate-pulse rounded-md bg-muted/30" />
            <div className="mt-4 h-10 w-64 animate-pulse rounded-md bg-muted/20" />
            <div className="mt-12 grid w-full gap-8 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-[24px] bg-surface/50 border border-border/40 shadow-sm" />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
