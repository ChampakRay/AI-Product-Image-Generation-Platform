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

    if (type === "dashboard") {
        return (
            <svg {...common}>
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
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

    if (type === "api") {
        return (
            <svg {...common}>
                <path d="M4 19V9" />
                <path d="M10 19V5" />
                <path d="M16 19v-7" />
                <path d="M22 19V3" />
            </svg>
        );
    }

    if (type === "provider") {
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

    if (type === "model") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.4 1.4-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L9 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H7.6v-2h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L9 9l1.4-1.4.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h2v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L20 9l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2h-.2a1.7 1.7 0 0 0-1.8 1Z" />
            </svg>
        );
    }

    if (type === "arrow") {
        return (
            <svg {...common}>
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
                >
                    <Icon type={icon} />
                </div>
            </div>
        </div>
    );
}

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/admin/dashboard"
                );

                setDashboard(
                    response.data?.data ||
                        response.data ||
                        {}
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Unable to load the admin dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <section>
                    <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />

                    <div className="mt-3 h-9 w-64 animate-pulse rounded bg-slate-200" />

                    <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-slate-100" />
                </section>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                    ))}
                </div>

                <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <section>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        Administration
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage your AI image generation platform.
                    </p>
                </section>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    <p className="font-semibold">
                        Unable to load dashboard
                    </p>

                    <p className="mt-1">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    const data = dashboard || {};

    const generations = data.generations || {};
    const apiUsage = data.api_usage || {};
    const providers = data.ai_providers || {};
    const products = data.products || {};
    const users = data.users || {};

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Administration
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                            Admin Dashboard
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            Manage AI providers and models, monitor
                            generation activity, and review API usage.
                        </p>
                    </div>
                </div>
            </section>

            {/* Platform Overview */}
            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-950">
                        Platform Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Key metrics from your AI image generation
                        platform.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Generations"
                        value={generations.total ?? 0}
                        description="All generations"
                        icon="dashboard"
                        iconBackground="bg-indigo-50"
                        iconColor="text-indigo-600"
                    />

                    <StatCard
                        title="Completed"
                        value={generations.completed ?? 0}
                        description="Successful generations"
                        icon="success"
                        iconBackground="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />

                    <StatCard
                        title="Failed"
                        value={generations.failed ?? 0}
                        description="Failed generations"
                        icon="failed"
                        iconBackground="bg-red-50"
                        iconColor="text-red-600"
                    />

                    <StatCard
                        title="API Requests"
                        value={apiUsage.total_requests ?? 0}
                        description="Logged API requests"
                        icon="api"
                        iconBackground="bg-blue-50"
                        iconColor="text-blue-600"
                    />
                </div>
            </section>

            {/* Additional platform information */}
            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-950">
                        Platform Activity
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Additional information about your platform.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Users
                        </p>

                        <p className="mt-3 text-2xl font-bold text-slate-950">
                            {users.total ?? 0}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {users.active ?? 0} active users
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Products
                        </p>

                        <p className="mt-3 text-2xl font-bold text-slate-950">
                            {products.total ?? 0}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {products.active ?? 0} active products
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            AI Providers
                        </p>

                        <p className="mt-3 text-2xl font-bold text-slate-950">
                            {providers.total ?? 0}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {providers.active ?? 0} active providers
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Avg. API Response
                        </p>

                        <p className="mt-3 text-2xl font-bold text-slate-950">
                            {apiUsage.average_response_time_ms ??
                                0}{" "}
                            <span className="text-sm font-medium text-slate-400">
                                ms
                            </span>
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Average provider response time
                        </p>
                    </div>
                </div>
            </section>

            {/* Administration */}
            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-950">
                        Administration
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Configure the services behind your image
                        generation platform.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <a
                        href="/admin/providers"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <Icon type="provider" />
                            </div>

                            <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500">
                                <Icon type="arrow" />
                            </span>
                        </div>

                        <h3 className="mt-5 text-base font-semibold text-slate-900">
                            AI Providers
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Configure providers and manage the API
                            services used by the platform.
                        </p>
                    </a>

                    <a
                        href="/admin/models"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Icon type="model" />
                            </div>

                            <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                                <Icon type="arrow" />
                            </span>
                        </div>

                        <h3 className="mt-5 text-base font-semibold text-slate-900">
                            AI Models
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Add and manage the image-generation models
                            available to users.
                        </p>
                    </a>

                    <a
                        href="/admin/api-usage"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Icon type="api" />
                            </div>

                            <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500">
                                <Icon type="arrow" />
                            </span>
                        </div>

                        <h3 className="mt-5 text-base font-semibold text-slate-900">
                            API Usage
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Review provider requests, response times,
                            and API activity.
                        </p>
                    </a>
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;