import { useEffect, useState } from "react";
import api from "../../api/axios";

function StatCard({ title, value, description }) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
                {title}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-xs text-gray-500">
                    {description}
                </p>
            )}
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
            <div className="p-6">
                <h2 className="text-2xl font-bold">
                    Admin Dashboard
                </h2>

                <div className="mt-6 text-sm text-gray-500">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold">
                    Admin Dashboard
                </h2>

                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    const data = dashboard || {};

    return (
        <div className="p-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Admin Dashboard
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Manage AI providers, models, and monitor
                    platform usage.
                </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Generations"
                    value={
                        data.total_generations ??
                        data.generations_count ??
                        0
                    }
                    description="All generations"
                />

                <StatCard
                    title="Completed"
                    value={
                        data.completed_generations ??
                        data.successful_generations ??
                        0
                    }
                    description="Successful generations"
                />

                <StatCard
                    title="Failed"
                    value={
                        data.failed_generations ??
                        0
                    }
                    description="Failed generations"
                />

                <StatCard
                    title="API Requests"
                    value={
                        data.api_usage_count ??
                        data.total_api_requests ??
                        0
                    }
                    description="Logged API requests"
                />
            </div>

            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">
                    Administration
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                    Use the administration menu to configure
                    AI providers, add models, and review API
                    activity.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <a
                        href="/admin/providers"
                        className="rounded-lg border p-4 transition hover:bg-gray-50"
                    >
                        <p className="font-semibold">
                            AI Providers
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure providers and API keys.
                        </p>
                    </a>

                    <a
                        href="/admin/models"
                        className="rounded-lg border p-4 transition hover:bg-gray-50"
                    >
                        <p className="font-semibold">
                            AI Models
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Add and manage available models.
                        </p>
                    </a>

                    <a
                        href="/admin/api-usage"
                        className="rounded-lg border p-4 transition hover:bg-gray-50"
                    >
                        <p className="font-semibold">
                            API Usage
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Review provider requests and errors.
                        </p>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;