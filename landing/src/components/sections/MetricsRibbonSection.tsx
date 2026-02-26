export function MetricsRibbonSection() {
    const metrics = [
        { value: "< 2s", label: "State Update Latency" },
        { value: "< 300ms", label: "Trigger Latency" },
        { value: "100%", label: "Replay Determinism" },
    ];

    return (
        <section className="border-y border-gray-200 bg-white py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-center">
                    {metrics.map((m, i) => (
                        <div key={i} className="py-6 md:py-0 px-4 flex flex-col items-center justify-center">
                            <dt className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-500 mb-2">
                                {m.label}
                            </dt>
                            <dd className="text-4xl font-extrabold tracking-tight text-indigo-600 font-serif">
                                {m.value}
                            </dd>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
