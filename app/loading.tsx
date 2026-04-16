export default function RootLoading() {
  return (
    <main className="page-shell space-y-5 py-8">
      <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
      <div className="glass-panel rounded-[28px] p-6">
        <div className="h-8 w-72 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/10" />
        <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-panel rounded-[24px] p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </main>
  );
}
