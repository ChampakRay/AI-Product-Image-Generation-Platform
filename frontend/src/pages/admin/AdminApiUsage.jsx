import { useEffect, useState } from "react";
import api from "../../api/axios";

function AdminApiUsage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadLogs = async () => {
        try {
            setLoading(true);
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
        }
    };

    useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs();
}, []);

    return (
        <div className="p-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    API Usage
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Review AI provider requests and generation
                    responses.
                </p>
            </div>

            {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
                {loading ? (
                    <div className="p-6 text-sm text-gray-500">
                        Loading API usage...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">
                        No API usage records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">
                                        ID
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Provider
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Endpoint
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Response Time
                                    </th>

                                    <th className="px-5 py-3 font-semibold">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            {log.id}
                                        </td>

                                        <td className="px-5 py-4">
                                            {log.ai_provider
                                                ?.name ||
                                                log.provider
                                                    ?.name ||
                                                log.aiProvider
                                                    ?.name ||
                                                "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="break-all text-xs text-gray-600">
                                                {log.endpoint ||
                                                    "—"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    Number(
                                                        log.response_status
                                                    ) >= 200 &&
                                                    Number(
                                                        log.response_status
                                                    ) < 300
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {log.response_status ??
                                                    "—"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            {log.response_time_ms !=
                                            null
                                                ? `${log.response_time_ms} ms`
                                                : "—"}
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                                            {log.created_at
                                                ? new Date(
                                                      log.created_at
                                                  ).toLocaleString()
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminApiUsage;