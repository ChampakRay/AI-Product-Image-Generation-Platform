import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL = "http://127.0.0.1:8000";

function StatIcon({ type }) {
    const icons = {
        total: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),

        completed: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
            </svg>
        ),

        processing: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 3v3" />
                <path d="M12 18v3" />
                <path d="m4.22 4.22 2.12 2.12" />
                <path d="m17.66 17.66 2.12 2.12" />
                <path d="M3 12h3" />
                <path d="M18 12h3" />
                <path d="m4.22 19.78 2.12-2.12" />
                <path d="m17.66 6.34 2.12-2.12" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        ),

        failed: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="9" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
            </svg>
        ),
    };

    return icons[type];
}

function StatusBadge({ status }) {
    const styles = {
        completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        processing: "bg-amber-50 text-amber-700 ring-amber-600/10",
        pending: "bg-blue-50 text-blue-700 ring-blue-600/10",
        failed: "bg-red-50 text-red-700 ring-red-600/10",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                styles[status] || "bg-slate-50 text-slate-600 ring-slate-500/10"
            }`}
        >
            {status}
        </span>
    );
}

function Dashboard() {
    const {
        data: generations = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["generations"],
        queryFn: async () => {
            const response = await api.get("/generations");

            return response.data.data?.data || [];
        },
    });

    const totalGenerations = generations.length;

    const completedGenerations = generations.filter(
        (generation) => generation.status === "completed"
    ).length;

    const failedGenerations = generations.filter(
        (generation) => generation.status === "failed"
    ).length;

    const processingGenerations = generations.filter(
        (generation) =>
            generation.status === "processing" ||
            generation.status === "pending"
    ).length;

    const recentGenerations = generations.slice(0, 5);

    const statistics = [
        {
            label: "Total Generations",
            value: totalGenerations,
            icon: "total",
            iconBackground: "bg-indigo-50",
            iconColor: "text-indigo-600",
        },
        {
            label: "Completed",
            value: completedGenerations,
            icon: "completed",
            iconBackground: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            label: "Processing",
            value: processingGenerations,
            icon: "processing",
            iconBackground: "bg-amber-50",
            iconColor: "text-amber-600",
        },
        {
            label: "Failed",
            value: failedGenerations,
            icon: "failed",
            iconBackground: "bg-red-50",
            iconColor: "text-red-600",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        AI Product Studio
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Create professional product imagery
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        Generate high-quality product images using AI,
                        reference images, and customizable generation settings.
                    </p>
                </div>

                <Link
                    to="/generate"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
                        <path d="M19 16l.7 2.3L22 19l-2.3.7L19 16z" />
                    </svg>
                    Generate New Image
                </Link>
            </section>

            {/* Error */}
            {isError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <svg
                        className="mt-0.5 shrink-0"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>

                    <div>
                        <p className="font-semibold">
                            Unable to load dashboard
                        </p>

                        <p className="mt-1 text-red-600">
                            {error?.response?.data?.message ||
                                "Something went wrong while loading your generations."}
                        </p>
                    </div>
                </div>
            )}

            {/* Statistics */}
            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Your Workspace
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        A quick overview of your image generation activity.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statistics.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {stat.label}
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                        {isLoading ? "—" : stat.value}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBackground} ${stat.iconColor}`}
                                >
                                    <StatIcon type={stat.icon} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Generations */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Recent Generations
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Your latest product image generations.
                        </p>
                    </div>

                    <Link
                        to="/history"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                    >
                        View All
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14" />
                            <path d="m13 6 6 6-6 6" />
                        </svg>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-4 p-6">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex animate-pulse items-center gap-4"
                            >
                                <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100" />

                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 rounded bg-slate-100" />
                                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : recentGenerations.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <svg
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                            </svg>
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            No generations yet
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            Create your first AI product image and it will
                            appear here.
                        </p>

                        <Link
                            to="/generate"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Generate Image
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {recentGenerations.map((generation) => {
                            const imageUrl =
                                generation.output_image_path
                                    ? `${BACKEND_URL}/storage/${generation.output_image_path}`
                                    : null;

                            return (
                                <div
                                    key={generation.id}
                                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:p-6"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={
                                                    generation.product?.name ||
                                                    "Generated product image"
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                No image
                                            </div>
                                        )}
                                    </div>

                                    {/* Information */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-slate-800">
                                                {generation.product?.name ||
                                                    "Product"}
                                            </p>

                                            <StatusBadge
                                                status={generation.status}
                                            />
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                                            {generation.prompt}
                                        </p>

                                        <p className="mt-1.5 text-xs text-slate-400">
                                            {new Date(
                                                generation.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* View */}
                                    <Link
                                        to={`/generations/${generation.id}`}
                                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        View
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 shadow-sm sm:p-8">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
                            <span>✦</span>
                            AI-powered creation
                        </div>

                        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                            Ready to create something new?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-indigo-100">
                            Turn your product references and ideas into
                            professional imagery with AI.
                        </p>
                    </div>

                    <Link
                        to="/generate"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                    >
                        Start Generating
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14" />
                            <path d="m13 6 6 6-6 6" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;