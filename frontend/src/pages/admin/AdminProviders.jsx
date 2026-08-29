import { useEffect, useState } from "react";
import api from "../../api/axios";

const emptyForm = {
    name: "",
    slug: "",
    driver_key: "",
    api_key: "",
    endpoint_url: "",
    is_active: true,
    is_default: false,
};

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

    if (type === "provider") {
        return (
            <svg {...common}>
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
            </svg>
        );
    }

    if (type === "key") {
        return (
            <svg {...common}>
                <circle cx="8" cy="15" r="4" />
                <path d="m11 12 8-8" />
                <path d="m16 7 2 2" />
                <path d="m14 9 2 2" />
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

    if (type === "edit") {
        return (
            <svg {...common}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z" />
            </svg>
        );
    }

    if (type === "delete") {
        return (
            <svg {...common}>
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="m6 7 1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
            </svg>
        );
    }

    if (type === "plus") {
        return (
            <svg {...common}>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </svg>
        );
    }

    return null;
}

function AdminProviders() {
    const [providers, setProviders] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadProviders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/ai-providers"
            );

            setProviders(
                response.data?.data || []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load AI providers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProviders();
    }, []);

    const handleChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (editingId) {
                await api.put(
                    `/admin/ai-providers/${editingId}`,
                    form
                );

                setSuccess(
                    "AI provider updated successfully."
                );
            } else {
                await api.post(
                    "/admin/ai-providers",
                    form
                );

                setSuccess(
                    "AI provider added successfully."
                );
            }

            resetForm();
            await loadProviders();
        } catch (err) {
            const validationErrors =
                err.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    ).flat()[0];

                setError(
                    firstError ||
                        "Please check the form."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                        "Unable to save the AI provider."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (provider) => {
        setEditingId(provider.id);

        setForm({
            name: provider.name || "",
            slug: provider.slug || "",
            driver_key:
                provider.driver_key || "",
            api_key: "",
            endpoint_url:
                provider.endpoint_url || "",
            is_active:
                Boolean(provider.is_active),
            is_default:
                Boolean(provider.is_default),
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (provider) => {
        if (
            !window.confirm(
                `Delete "${provider.name}"?`
            )
        ) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/admin/ai-providers/${provider.id}`
            );

            setSuccess(
                "AI provider deleted successfully."
            );

            await loadProviders();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to delete the provider."
            );
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                        <Icon type="provider" />
                        Administration
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        AI Providers
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        Connect the platform to AI services by
                        configuring their API credentials and connection
                        details.
                    </p>
                </div>

                {!editingId && (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {providers.length}{" "}
                        {providers.length === 1
                            ? "provider"
                            : "providers"}{" "}
                        configured
                    </div>
                )}
            </section>

            {/* Alerts */}
            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                        <span className="font-bold">!</span>
                    </div>

                    <div>
                        <p className="font-semibold">
                            Something went wrong
                        </p>

                        <p className="mt-1 text-red-600">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                        ✓
                    </div>

                    <div>
                        <p className="font-semibold">
                            Success
                        </p>

                        <p className="mt-1 text-emerald-600">
                            {success}
                        </p>
                    </div>
                </div>
            )}

            {/* Provider Form */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                {editingId ? (
                                    <Icon type="edit" />
                                ) : (
                                    <Icon type="plus" />
                                )}
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    {editingId
                                        ? "Edit AI Provider"
                                        : "Add AI Provider"}
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    {editingId
                                        ? "Update the provider connection settings."
                                        : "Connect a new AI service to the platform."}
                                </p>
                            </div>
                        </div>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                            >
                                Cancel editing
                            </button>
                        )}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-7"
                >
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Provider Name */}
                        <div>
                            <label
                                htmlFor="provider-name"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Provider Name
                            </label>

                            <input
                                id="provider-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Hugging Face"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />

                            <p className="mt-1.5 text-xs text-slate-400">
                                The name shown to administrators.
                            </p>
                        </div>

                        {/* Slug */}
                        <div>
                            <label
                                htmlFor="provider-slug"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Slug
                            </label>

                            <input
                                id="provider-slug"
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                placeholder="e.g. huggingface"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />

                            <p className="mt-1.5 text-xs text-slate-400">
                                A unique identifier for the provider.
                            </p>
                        </div>

                        {/* Driver Key */}
                        <div>
                            <label
                                htmlFor="provider-driver"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Driver Key
                            </label>

                            <input
                                id="provider-driver"
                                name="driver_key"
                                value={form.driver_key}
                                onChange={handleChange}
                                required
                                placeholder="e.g. huggingface"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />

                            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
                                <strong>Important:</strong>{" "}
                                This must match a provider integration
                                already supported by the application.
                            </div>
                        </div>

                        {/* Endpoint */}
                        <div>
                            <label
                                htmlFor="provider-endpoint"
                                className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700"
                            >
                                Endpoint URL
                                <span className="font-normal text-slate-400">
                                    (optional)
                                </span>
                            </label>

                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                    <Icon type="server" />
                                </div>

                                <input
                                    id="provider-endpoint"
                                    name="endpoint_url"
                                    value={
                                        form.endpoint_url
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="https://api.example.com"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <p className="mt-1.5 text-xs text-slate-400">
                                Only required if the provider uses a custom
                                API endpoint.
                            </p>
                        </div>
                    </div>

                    {/* API Key */}
                    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                <Icon type="key" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    API Key
                                </h3>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    This is the key provided by your AI
                                    service. It is stored securely on the
                                    server and is never displayed after
                                    saving.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="provider-api-key"
                                className="sr-only"
                            >
                                API Key
                            </label>

                            <input
                                id="provider-api-key"
                                type="password"
                                name="api_key"
                                value={form.api_key}
                                onChange={handleChange}
                                required={!editingId}
                                placeholder={
                                    editingId
                                        ? "Leave empty to keep the existing API key"
                                        : "Paste your API key here"
                                }
                                className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />

                            <div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
                                <span className="mt-0.5 text-emerald-500">
                                    ●
                                </span>

                                <span>
                                    Your API key is sent securely to the
                                    server. Never share it publicly.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={
                                    form.is_active
                                }
                                onChange={
                                    handleChange
                                }
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />

                            <span>
                                <span className="block text-sm font-semibold text-slate-700">
                                    Active provider
                                </span>

                                <span className="mt-1 block text-xs leading-5 text-slate-400">
                                    Allow this provider to be used for
                                    image generation.
                                </span>
                            </span>
                        </label>

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30">
                            <input
                                type="checkbox"
                                name="is_default"
                                checked={
                                    form.is_default
                                }
                                onChange={
                                    handleChange
                                }
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />

                            <span>
                                <span className="block text-sm font-semibold text-slate-700">
                                    Default provider
                                </span>

                                <span className="mt-1 block text-xs leading-5 text-slate-400">
                                    Use this provider as the default
                                    option when applicable.
                                </span>
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Icon
                                        type={
                                            editingId
                                                ? "edit"
                                                : "plus"
                                        }
                                    />

                                    {editingId
                                        ? "Update Provider"
                                        : "Add Provider"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>

            {/* Configured Providers */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Configured Providers
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            AI services currently connected to the platform.
                        </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                        {providers.length} configured
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4 p-6">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="flex animate-pulse items-center gap-4"
                            >
                                <div className="h-11 w-11 rounded-xl bg-slate-100" />

                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-40 rounded bg-slate-100" />
                                    <div className="h-3 w-56 rounded bg-slate-100" />
                                </div>

                                <div className="h-9 w-20 rounded bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : providers.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Icon type="provider" />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            No AI providers configured
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Add your first AI provider above to make an AI
                            service available to the platform.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {providers.map((provider) => (
                            <div
                                key={provider.id}
                                className="p-5 transition hover:bg-slate-50/60 sm:p-6"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                            <Icon type="provider" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-slate-900">
                                                    {provider.name}
                                                </h3>

                                                {provider.is_default && (
                                                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                                                        Default
                                                    </span>
                                                )}

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                        provider.is_active
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {provider.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                                                <span>
                                                    Driver:{" "}
                                                    <strong className="font-medium text-slate-500">
                                                        {
                                                            provider.driver_key
                                                        }
                                                    </strong>
                                                </span>

                                                <span>
                                                    Models:{" "}
                                                    <strong className="font-medium text-slate-500">
                                                        {provider.ai_models_count ??
                                                            0}
                                                    </strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 lg:shrink-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(
                                                    provider
                                                )
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 lg:flex-none"
                                        >
                                            <Icon type="edit" />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    provider
                                                )
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 lg:flex-none"
                                        >
                                            <Icon type="delete" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminProviders;