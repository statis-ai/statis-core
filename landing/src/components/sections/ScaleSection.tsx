export function ScaleSection() {
    const metrics = [
        {
            value: "< 2s",
            label: "p95 State Update Latency",
            description: "(Event ingestion to materialized state commit)"
        },
        {
            value: "< 300ms",
            label: "p95 Trigger Latency",
            description: "(State commit to webhook fired)"
        },
        {
            value: "100%",
            label: "Correctness",
            description: "Cryptographic guarantees that state_at(rev) hashes perfectly match historical states."
        }
    ];

    return (
        <section className="relative overflow-hidden py-24 sm:py-32 border-t border-white/5 bg-[#080808]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-base/7 font-semibold text-brand-accent uppercase tracking-wide">BUILT FOR SCALE</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Engineered for the P95.
                    </p>
                </div>

                <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {metrics.map((metric, index) => (
                        <div key={index} className="flex flex-col border-l-2 border-brand-accent/30 pl-6 hover:border-brand-accent transition-colors duration-300">
                            <dt className="text-sm font-semibold leading-6 text-brand-muted uppercase tracking-wide">{metric.label}</dt>
                            <dd className="order-first text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,255,170,0.3)]">{metric.value}</dd>
                            <dd className="mt-4 text-sm leading-6 text-brand-muted">{metric.description}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
