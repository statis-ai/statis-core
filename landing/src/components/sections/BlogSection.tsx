export function BlogSection() {
    const posts = [
        {
            title: "Why AI Agents Need Materialized State",
            description: "Polling APIs is the leading cause of agent hallucinations and workflow corruption. Explore why state materialization is the missing primitive in agentic architecture.",
            date: "Oct 12, 2024",
            category: "Architecture",
            href: "#",
        },
        {
            title: "Building Deterministic Support Swarms",
            description: "How to orchestrate 5+ independent customer support agents without race conditions using Statis deterministic webhooks.",
            date: "Oct 05, 2024",
            category: "Case Study",
            href: "#",
        },
        {
            title: "The Problem with Vector Databases for State",
            description: "Vector DBs are excellent for semantic retrieval, but terrible for tracking if a user paid their invoice. Here is how to combine both.",
            date: "Sep 28, 2024",
            category: "Engineering",
            href: "#",
        },
    ];

    return (
        <section className="py-24 sm:py-32 bg-gray-50 border-t border-gray-200">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-serif">
                        Latest from the Blog
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Insights and architecture patterns for building deterministic AI swarms.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post, i) => (
                        <a key={i} href={post.href} className="flex flex-col rounded-3xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 group">
                            <div className="flex items-center gap-x-4 text-xs mb-6">
                                <time dateTime={post.date} className="text-gray-500">
                                    {post.date}
                                </time>
                                <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-indigo-600 hover:bg-gray-100">
                                    {post.category}
                                </span>
                            </div>
                            <div className="group relative">
                                <h3 className="mt-3 text-xl font-bold leading-6 text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
                                    {post.description}
                                </p>
                            </div>
                            <div className="mt-auto pt-8 flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                                Read article <span aria-hidden="true" className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
