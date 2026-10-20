export function ComingSoon({ title }: { title: string }) {
  return (
    <main className="
      flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center
    ">
      <h1 className="type-display text-on-surface">{title}</h1>
      <p className="type-body-md text-on-surface-variant">Coming soon</p>
    </main>
  );
}
