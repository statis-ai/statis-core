export function Dogfood() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-2 py-0.5 rounded"
          style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
        >
          Dogfood
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "var(--text)" }}>
          We used Statis to build Statis.
        </h2>
        <p
          className="mt-4 text-sm leading-relaxed max-w-xl mx-auto"
          style={{ color: "var(--text-2)" }}
        >
          Every action proposal, policy check, and execution receipt on this site ran through our own infrastructure.
        </p>
      </div>
    </section>
  );
}
