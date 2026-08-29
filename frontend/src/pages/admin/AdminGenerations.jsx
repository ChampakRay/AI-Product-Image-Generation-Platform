import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";

function StatusBadge({ status }) {
    const styles = {
        completed:
            "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        processing:
            "bg-amber-50 text-amber-700 ring-amber-600/10",
        pending:
            "bg-blue-50 text-blue-700 ring-blue-600/10",
        failed:
            "bg-red-50 text-red-700 ring-red-600/10",
    };

    const dots = {
        completed: "bg-emerald-500",
        processing: "bg-amber-500",
        pending: "bg-blue-500",
        failed: "bg-red-500",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                styles[status] ||
                "bg-slate-50 text-slate-600 ring-slate-500/10"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    dots[status] || "bg-slate-400"
                }`}
            />

            {status || "unknown"}
        </span>
    );
}

function AdminGenerations() {
    const [generations, setGenerations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
    });

    const [deletingId, setDeletingId] = useState(null);

    const loadGenerations = async (page = 1) => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                per_page: 20,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (status) {
                params.status = status;
            }

            const response = await api.get(
                "/admin/generations",
                { params }
            );

            const data =
                response.data?.data ||
                response.data ||
                {};

            setGenerations(
                Array.isArray(data)
                    ? data
                    : data.data || []
            );

            setPagination({
                current_page:
                    data.current_page || 1,

                last_page:
                    data.last_page || 1,

                total:
                    data.total || 0,

                from:
                    data.from || 0,

                to:
                    data.to || 0,
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load generations."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadGenerations(1);
        }, 300);

        return () => clearTimeout(timer);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status]);

    const handleDelete = async (generationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this generation?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(generationId);

            await api.delete(
                `/admin/generations/${generationId}`
            );

            await loadGenerations(
                generations.length === 1 &&
                    pagination.current_page > 1
                    ? pagination.current_page - 1
                    : pagination.current_page
            );
        } catch (err) {
            window.alert(
                err.response?.data?.message ||
                    "Unable to delete generation."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const imageUrl = (generation) => {
        if (!generation.output_image_path) {
            return null;
        }

        return `${BACKEND_URL}/storage/${generation.output_image_path}`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
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
                        <path d="M8 8h8" />
                        <path d="M8 12h8" />
                        <path d="M8 16h5" />
                    </svg>

                    Platform activity
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Generations
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Monitor and manage image generations across
                    the entire platform.
                </p>
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Search
                        </label>

                        <div className="relative">
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="7"
                                />
                                <path d="m20 20-4-4" />
                            </svg>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by user, email, product, model, or prompt..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="">
                                All statuses
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                            <option value="processing">
                                Processing
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="failed">
                                Failed
                            </option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Summary */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div>
                    <p className="text-sm font-semibold text-slate-800">
                        Platform generations
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                        {pagination.total} total generations
                    </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                    {pagination.total}
                </div>
            </div>

            {/* Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-6">
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-16 animate-pulse rounded-xl bg-slate-100"
                                    />
                                )
                            )}
                        </div>
                    </div>
                ) : generations.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <svg
                                width="28"
                                height="28"
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
                                <circle
                                    cx="8.5"
                                    cy="8.5"
                                    r="1.5"
                                />
                                <path d="m21 15-5-5L5 21" />
                            </svg>
                        </div>

                        <h2 className="mt-5 text-xl font-semibold text-slate-900">
                            No generations found
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Try changing your search or status
                            filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-left text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        Generation
                                    </th>

                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        User
                                    </th>

                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        Product
                                    </th>

                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        Model
                                    </th>

                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 font-semibold text-slate-600">
                                        Created
                                    </th>

                                    <th className="px-5 py-4 text-right font-semibold text-slate-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {generations.map(
                                    (generation) => {
                                        const image =
                                            imageUrl(
                                                generation
                                            );

                                        const user =
                                            generation.user;

                                        const model =
                                            generation.ai_model ||
                                            generation.aiModel;

                                        const provider =
                                            generation.ai_provider ||
                                            generation.aiProvider;

                                        return (
                                            <tr
                                                key={
                                                    generation.id
                                                }
                                                className="transition hover:bg-slate-50"
                                            >
                                                {/* Generation */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                                            {image ? (
                                                                <img
                                                                    src={
                                                                        image
                                                                    }
                                                                    alt="Generated product"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                                    <svg
                                                                        width="20"
                                                                        height="20"
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
                                                                        <path d="m21 15-5-5L5 21" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-800">
                                                                #
                                                                {
                                                                    generation.id
                                                                }
                                                            </p>

                                                            <p className="mt-1 max-w-[260px] truncate text-xs text-slate-400">
                                                                {generation.prompt ||
                                                                    "No prompt"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* User */}
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {user?.name ||
                                                                "Unknown user"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {user?.email ||
                                                                "No email"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Product */}
                                                <td className="px-5 py-4">
                                                    <span className="font-medium text-slate-700">
                                                        {generation
                                                            .product
                                                            ?.name ||
                                                            "Unknown"}
                                                    </span>
                                                </td>

                                                {/* Model */}
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-medium text-slate-700">
                                                            {model?.name ||
                                                                "Unknown"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {provider?.name ||
                                                                "Unknown provider"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={
                                                            generation.status
                                                        }
                                                    />
                                                </td>

                                                {/* Date */}
                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <p className="text-xs font-medium text-slate-600">
                                                        {generation.created_at
                                                            ? new Date(
                                                                  generation.created_at
                                                              ).toLocaleDateString()
                                                            : "—"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {generation.created_at
                                                            ? new Date(
                                                                  generation.created_at
                                                              ).toLocaleTimeString()
                                                            : ""}
                                                    </p>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            to={`/admin/generations/${generation.id}`}
                                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                                        >
                                                            View
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    generation.id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                generation.id
                                                            }
                                                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {deletingId ===
                                                            generation.id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Pagination */}
            {!loading &&
                generations.length > 0 && (
                    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-700">
                                {pagination.from}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-slate-700">
                                {pagination.to}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-700">
                                {pagination.total}
                            </span>{" "}
                            generations
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={
                                    pagination.current_page <=
                                        1 ||
                                    loading
                                }
                                onClick={() =>
                                    loadGenerations(
                                        pagination.current_page -
                                            1
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="px-2 text-xs font-semibold text-slate-500">
                                Page{" "}
                                {
                                    pagination.current_page
                                }{" "}
                                of{" "}
                                {
                                    pagination.last_page
                                }
                            </span>

                            <button
                                type="button"
                                disabled={
                                    pagination.current_page >=
                                        pagination.last_page ||
                                    loading
                                }
                                onClick={() =>
                                    loadGenerations(
                                        pagination.current_page +
                                            1
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default AdminGenerations;