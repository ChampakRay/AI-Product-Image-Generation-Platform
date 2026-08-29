import { useEffect, useState } from "react";
import api from "../../api/axios";

function SearchIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    );
}

function UserIcon() {
    return (
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
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
        </svg>
    );
}

function CheckIcon() {
    return (
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
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

function PauseIcon() {
    return (
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
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg
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
    );
}

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [pagination, setPagination] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const loadUsers = async (
        page = 1,
        searchValue = search,
        statusValue = status
    ) => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
            };

            if (searchValue.trim()) {
                params.search =
                    searchValue.trim();
            }

            if (statusValue) {
                params.status =
                    statusValue;
            }

            const response = await api.get(
                "/admin/users",
                { params }
            );

            const payload =
                response.data?.data ||
                response.data ||
                {};

            setUsers(
                Array.isArray(payload)
                    ? payload
                    : payload.data || []
            );

            setPagination(
                Array.isArray(payload)
                    ? null
                    : payload
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    const loadInitialUsers = async () => {
        await loadUsers(1, "", "");
    };

    loadInitialUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();

        loadUsers(1, search, status);
    };

    const handleStatusFilter = (
        event
    ) => {
        const value =
            event.target.value;

        setStatus(value);

        loadUsers(1, search, value);
    };

    const handleStatusChange = async (
        user
    ) => {
        const nextStatus =
            user.status === "active"
                ? "suspended"
                : "active";

        const confirmed =
            window.confirm(
                nextStatus === "suspended"
                    ? `Suspend ${user.name}? They will no longer be able to access the platform.`
                    : `Activate ${user.name}?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingId(user.id);
            setError("");

            await api.put(
                `/admin/users/${user.id}/status`,
                {
                    status: nextStatus,
                }
            );

            await loadUsers(
                pagination?.current_page || 1,
                search,
                status
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to update user status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(
            date
        ).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Administration
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    Manage Users
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    View users, monitor their generation
                    activity, and manage account status.
                </p>
            </section>

            {/* Error */}
            {error && (
                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertIcon />

                    <div>
                        <p className="font-semibold">
                            Something went wrong
                        </p>

                        <p className="mt-1">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-4 lg:flex-row"
                >
                    <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <SearchIcon />
                        </span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search by name or email..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={
                            handleStatusFilter
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                        <option value="">
                            All statuses
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="suspended">
                            Suspended
                        </option>
                    </select>

                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Search
                    </button>
                </form>
            </section>

            {/* Users */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-6">
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-14 animate-pulse rounded-xl bg-slate-100"
                                    />
                                )
                            )}
                        </div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <UserIcon />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            No users found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or
                            status filter.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-600">
                                            User
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-slate-600">
                                            Joined
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-slate-600">
                                            Generations
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-slate-600">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right font-semibold text-slate-600">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {users.map(
                                        (user) => {
                                            const isActive =
                                                user.status ===
                                                "active";

                                            return (
                                                <tr
                                                    key={
                                                        user.id
                                                    }
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                                                                {(
                                                                    user.name ||
                                                                    user.email ||
                                                                    "U"
                                                                )
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="truncate font-semibold text-slate-900">
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </p>

                                                                    {user.role ===
                                                                        "admin" && (
                                                                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                                                                            Admin
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <p className="truncate text-xs text-slate-500">
                                                                    {
                                                                        user.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-slate-500">
                                                        {formatDate(
                                                            user.created_at
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-slate-900">
                                                            {user.generations_count ??
                                                                0}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                isActive
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-red-50 text-red-700"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    isActive
                                                                        ? "bg-emerald-500"
                                                                        : "bg-red-500"
                                                                }`}
                                                            />

                                                            {isActive
                                                                ? "Active"
                                                                : "Suspended"}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    user
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                user.id
                                                            }
                                                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                                isActive
                                                                    ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                                                                    : "border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
                                                            }`}
                                                        >
                                                            {updatingId ===
                                                            user.id ? (
                                                                "Updating..."
                                                            ) : isActive ? (
                                                                <>
                                                                    <PauseIcon />
                                                                    Suspend
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckIcon />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination &&
                            pagination.last_page >
                                1 && (
                                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
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
                                        users
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                !pagination.prev_page_url
                                            }
                                            onClick={() =>
                                                loadUsers(
                                                    pagination.current_page -
                                                        1,
                                                    search,
                                                    status
                                                )
                                            }
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                !pagination.next_page_url
                                            }
                                            onClick={() =>
                                                loadUsers(
                                                    pagination.current_page +
                                                        1,
                                                    search,
                                                    status
                                                )
                                            }
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                    </>
                )}
            </section>
        </div>
    );
}

export default AdminUsers;
