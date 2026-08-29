import { useEffect, useState } from "react";
import api from "../../api/axios";

function Icon({ type }) {
    const common = {
        width: 18,
        height: 18,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    if (type === "usage") {
        return (
            <svg {...common}>
                <path d="M4 19V9" />
                <path d="M10 19V5" />
                <path d="M16 19v-7" />
                <path d="M22 19V3" />
            </svg>
        );
    }

    if (type === "success") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
            </svg>
        );
    }

    if (type === "failed") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="9" />
                <path d="m9 9 6 6" />
                <path d="m15 9-6 6" />
            </svg>
        );
    }

    if (type === "clock") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </svg>
        );
    }

    if (type === "refresh") {
        return (
            <svg {...common}>
                <path d="M20 11a8 8 0 0 0-14.7-4L4 9" />
                <path d="M4 4v5h5" />
                <path d="M4 13a8 8 0 0 0 14.7 4L20 15" />
                <path d="M20 20v-5h-5" />
            </svg>
        );
    }

    if (type === "server") {
        return (
            <svg {...common}>
                <rect x="3" y="3" width="18" height="7" rx="1.5" />
                <rect x="3" y="14" width="18" height="7" rx="1.5" />
                <path d="M7 6.5h.01" />
                <path d="M7 17.5h.01" />
                <path d="M11 6.5h7" />
                <path d="M11 17.5h7" />
            </svg>
        );
    }

    return null;
}

function StatCard({
    title,
    value,
    description,
    icon,
    iconBackground,
    iconColor,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
                >
                    <Icon type={icon} />
                </div>
            </div>
        </div>
    );
}

function AdminApiUsage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadLogs = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                "/admin/api-usage-logs"
            );

            const data =
                response.data?.data ||
                response.data ||
                [];

            setLogs(
                Array.isArray(data)
                    ? data
                    : data.data || []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load API usage logs."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadLogs();
    }, []);

    const successfulRequests = logs.filter((log) => {
        const status = Number(
            log.response_status
        );

        return status >= 200 && status < 300;
    }).length;

    const failedRequests = logs.filter((log) => {
        const status = Number(
            log.response_status
        );

        return (
            !Number.isNaN(status) &&
            (status < 200 || status >= 300)
        );
    }).length;

    const responseTimes = logs
        .map((log) =>
            Number(log.response_time_ms)
        )
        .filter(
            (value) =>
                Number.isFinite(value) &&
                value >= 0
        );

    const averageResponseTime =
        responseTimes.length > 0
            ? Math.round(
                  responseTimes.reduce(
                      (sum, value) =>
                          sum + value,
                      0
                  ) /
                      responseTimes.length
              )
            : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                        <Icon type="usage" />
                        Administration
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        API Usage
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        Monitor AI provider requests, response times,
                        and API errors across the platform.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => loadLogs(true)}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    >
                        <Icon type="refresh" />
                    </span>

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>
            </section>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                        <Icon type="failed" />
                    </div>

                    <div>
                        <p className="font-semibold">
                            Unable to load API usage
                        </p>

                        <p className="mt-1 text-red-600">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Overview */}
            {!loading && (
                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Usage Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            A quick summary of the API activity currently
                            recorded by the platform.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Requests"
                            value={logs.length}
                            description="Recorded API calls"
                            icon="usage"
                            iconBackground="bg-indigo-50"
                            iconColor="text-indigo-600"
                        />

                        <StatCard
                            title="Successful"
                            value={
                                successfulRequests
                            }
                            description="2xx responses"
                            icon="success"
                            iconBackground="bg-emerald-50"
                            iconColor="text-emerald-600"
                        />

                        <StatCard
                            title="Failed"
                            value={failedRequests}
                            description="Non-2xx responses"
                            icon="failed"
                            iconBackground="bg-red-50"
                            iconColor="text-red-600"
                        />

                        <StatCard
                            title="Avg. Response Time"
                            value={`${averageResponseTime} ms`}
                            description="Based on recorded requests"
                            icon="clock"
                            iconBackground="bg-blue-50"
                            iconColor="text-blue-600"
                        />
                    </div>
                </section>
            )}

            {/* Logs */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Request Logs
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Detailed records of AI provider API activity.
                        </p>
                    </div>

                    {!loading && (
                        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                            {logs.length}{" "}
                            {logs.length === 1
                                ? "record"
                                : "records"}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-6">
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="flex animate-pulse items-center gap-4"
                                    >
                                        <div className="h-4 w-10 rounded bg-slate-100" />
                                        <div className="h-4 w-28 rounded bg-slate-100" />
                                        <div className="h-4 flex-1 rounded bg-slate-100" />
                                        <div className="h-6 w-16 rounded-full bg-slate-100" />
                                        <div className="h-4 w-20 rounded bg-slate-100" />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Icon type="server" />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            No API usage recorded
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            API requests will appear here once the platform
                            starts communicating with an AI provider.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50/70">
                                <tr>
                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        ID
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Provider
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Endpoint
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Response
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {logs.map((log) => {
                                    const status =
                                        Number(
                                            log.response_status
                                        );

                                    const successful =
                                        status >= 200 &&
                                        status < 300;

                                    const providerName =
                                        log.ai_provider
                                            ?.name ||
                                        log.provider
                                            ?.name ||
                                        log.aiProvider
                                            ?.name ||
                                        "—";

                                    return (
                                        <tr
                                            key={
                                                log.id
                                            }
                                            className="transition hover:bg-slate-50/60"
                                        >
                                            <td className="px-5 py-4 font-medium text-slate-500">
                                                #{log.id}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                        <Icon type="server" />
                                                    </div>

                                                    <span className="font-semibold text-slate-700">
                                                        {
                                                            providerName
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="max-w-[300px] px-5 py-4">
                                                <span className="block truncate font-mono text-xs text-slate-500">
                                                    {log.endpoint ||
                                                        "—"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        successful
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            successful
                                                                ? "bg-emerald-500"
                                                                : "bg-red-500"
                                                        }`}
                                                    />

                                                    {log.response_status ??
                                                        "—"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-slate-600">
                                                    <Icon type="clock" />

                                                    {log.response_time_ms !=
                                                    null
                                                        ? `${log.response_time_ms} ms`
                                                        : "—"}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                                                {log.created_at
                                                    ? new Date(
                                                          log.created_at
                                                      ).toLocaleString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminApiUsage;