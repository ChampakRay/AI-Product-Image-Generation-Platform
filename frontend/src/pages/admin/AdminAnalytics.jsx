import { useEffect, useState } from "react";
import api from "../../api/axios";

function StatCard({ title, value, description }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-xs text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        completed:
            "bg-emerald-50 text-emerald-700",
        processing:
            "bg-amber-50 text-amber-700",
        pending:
            "bg-blue-50 text-blue-700",
        failed:
            "bg-red-50 text-red-700",
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                styles[status] ||
                "bg-slate-100 text-slate-600"
            }`}
        >
            {status}
        </span>
    );
}

function AdminAnalytics() {
    const [analytics, setAnalytics] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/admin/analytics"
                );

                setAnalytics(
                    response.data?.data ||
                        response.data ||
                        {}
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Unable to load analytics."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

                    <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="h-32 animate-pulse rounded-2xl bg-slate-200"
                            />
                        )
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
                    <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        Analytics
                    </h1>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    const generationData =
        analytics?.generations || {};

    const apiData =
        analytics?.api_usage || {};

    const dailyData =
        analytics?.generations_per_day || [];

    const providers =
        analytics?.providers || [];

    const maxDaily =
        Math.max(
            ...dailyData.map(
                (item) => item.total
            ),
            1
        );

    return (
        <div className="space-y-8">
            {/* Header */}
            <section>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Platform analytics
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Analytics
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Monitor generation activity, AI provider usage,
                    and platform performance.
                </p>
            </section>

            {/* Generation stats */}
            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Generations
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Overall platform generation activity.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total"
                        value={
                            generationData.total ??
                            0
                        }
                        description="All generations"
                    />

                    <StatCard
                        title="Completed"
                        value={
                            generationData.completed ??
                            0
                        }
                        description="Successfully completed"
                    />

                    <StatCard
                        title="Failed"
                        value={
                            generationData.failed ??
                            0
                        }
                        description="Failed generations"
                    />

                    <StatCard
                        title="Success Rate"
                        value={`${generationData.success_rate ?? 0}%`}
                        description="Completed / total"
                    />
                </div>
            </section>

            {/* Daily chart + status */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
                {/* Daily generations */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Generations per day
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Last 7 days
                        </p>
                    </div>

                    <div className="mt-8 flex h-64 items-end gap-3">
                        {dailyData.map(
                            (item) => {
                                const height =
                                    Math.max(
                                        (item.total /
                                            maxDaily) *
                                            100,
                                        item.total >
                                            0
                                            ? 8
                                            : 2
                                    );

                                const date =
                                    new Date(
                                        `${item.date}T00:00:00`
                                    );

                                const label =
                                    date.toLocaleDateString(
                                        undefined,
                                        {
                                            weekday:
                                                "short",
                                        }
                                    );

                                return (
                                    <div
                                        key={
                                            item.date
                                        }
                                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                    >
                                        <span className="text-xs font-semibold text-slate-600">
                                            {
                                                item.total
                                            }
                                        </span>

                                        <div className="flex h-full w-full items-end">
                                            <div
                                                className="w-full rounded-t-lg bg-indigo-500 transition-all hover:bg-indigo-600"
                                                style={{
                                                    height: `${height}%`,
                                                }}
                                                title={`${item.total} generations`}
                                            />
                                        </div>

                                        <span className="text-[11px] font-medium text-slate-400">
                                            {
                                                label
                                            }
                                        </span>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </section>

                {/* Generation status */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Generation status
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Current status distribution.
                    </p>

                    <div className="mt-7 space-y-4">
                        {[
                            "completed",
                            "processing",
                            "pending",
                            "failed",
                        ].map(
                            (status) => {
                                const value =
                                    generationData[
                                        status
                                    ] ?? 0;

                                const total =
                                    generationData.total ||
                                    1;

                                const percentage =
                                    Math.round(
                                        (value /
                                            total) *
                                            100
                                    );

                                return (
                                    <div
                                        key={
                                            status
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <StatusBadge
                                                status={
                                                    status
                                                }
                                            />

                                            <span className="text-sm font-semibold text-slate-700">
                                                {
                                                    value
                                                }
                                            </span>
                                        </div>

                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </section>
            </div>

            {/* Provider + API */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Provider usage */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            AI provider usage
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            API requests grouped by provider.
                        </p>
                    </div>

                    {providers.length === 0 ? (
                        <div className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                            No provider usage data available.
                        </div>
                    ) : (
                        <div className="mt-6 space-y-5">
                            {providers.map(
                                (
                                    provider
                                ) => {
                                    const percentage =
                                        apiData.total_requests >
                                        0
                                            ? Math.round(
                                                  (provider.total_requests /
                                                      apiData.total_requests) *
                                                      100
                                              )
                                            : 0;

                                    return (
                                        <div
                                            key={
                                                provider.slug ||
                                                provider.provider
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {
                                                            provider.provider
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {
                                                            provider.total_requests
                                                        }{" "}
                                                        requests
                                                    </p>
                                                </div>

                                                <span className="text-sm font-semibold text-slate-600">
                                                    {
                                                        percentage
                                                    }
                                                    %
                                                </span>
                                            </div>

                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-indigo-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </section>

                {/* API performance */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            API performance
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Provider request performance.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Requests
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {
                                    apiData.total_requests ??
                                    0
                                }
                            </p>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                Success Rate
                            </p>

                            <p className="mt-2 text-2xl font-bold text-emerald-700">
                                {apiData.success_rate ??
                                    0}
                                %
                            </p>
                        </div>

                        <div className="rounded-xl bg-red-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                                Failed Requests
                            </p>

                            <p className="mt-2 text-2xl font-bold text-red-700">
                                {
                                    apiData.failed_requests ??
                                    0
                                }
                            </p>
                        </div>

                        <div className="rounded-xl bg-indigo-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                Avg Response
                            </p>

                            <p className="mt-2 text-2xl font-bold text-indigo-700">
                                {
                                    apiData.average_response_time_ms ??
                                    0
                                }
                                <span className="ml-1 text-sm font-semibold">
                                    ms
                                </span>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminAnalytics;
