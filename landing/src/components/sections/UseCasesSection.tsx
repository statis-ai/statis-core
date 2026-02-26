export function UseCasesSection() {
    const useCases = [
        {
            title: "Customer Support Swarms",
            description: "When a user reports a critical bug, an orchestration agent can trigger triaging, engineering context gathering, and user communication simultaneously without state deadlocks.",
            icon: "🎧",
        },
        {
            title: "Autonomous Sales Agents",
            description: "Sales agents can pause outreach immediately when the billing agent flags an invoice as overdue, avoiding embarrassing emails to frustrated customers.",
            icon: "💼",
        },
        {
            title: "Financial Auditors",
            description: "Multi-agent research teams analyzing SEC filings rely on Statis to build a cryptographically auditable trail of every fact extracted before finalizing reports.",
            icon: "📊",
        },
    ];

    return (
        <section className="py-24 sm:py-32 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-serif">
                        Built for Complex Workflows
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-gray-500">
                        Stop hardcoding logic between agents. Build loosely coupled swarms that react to a shared reality.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {useCases.map((uc, i) => (
                        <div key={i} className="rounded-3xl border border-gray-200 bg-gray-50 p-8 hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                                {uc.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{uc.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">{uc.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
