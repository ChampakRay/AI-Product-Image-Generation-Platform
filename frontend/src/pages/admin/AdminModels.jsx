import { useEffect, useState } from "react";
import api from "../../api/axios";

const emptyForm = {
    ai_provider_id: "",
    name: "",
    model_key: "",
    description: "",
    is_active: true,
    is_default: false,
    sort_order: 0,
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

    if (type === "model") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-2.6v-.8a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6v-2.6h.5a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.8a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.5v2.6h-.5a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
        );
    }

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

    if (type === "info") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <path d="M12 8h.01" />
            </svg>
        );
    }

    return null;
}

function AdminModels() {
    const [models, setModels] = useState([]);
    const [providers, setProviders] = useState([]);

    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                modelsResponse,
                providersResponse,
            ] = await Promise.all([
                api.get("/admin/ai-models"),
                api.get("/admin/ai-providers"),
            ]);

            setModels(
                modelsResponse.data?.data || []
            );

            setProviders(
                providersResponse.data?.data || []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load AI models."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
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

            const payload = {
                ...form,
                ai_provider_id:
                    Number(form.ai_provider_id),
                sort_order:
                    Number(form.sort_order),
            };

            if (editingId) {
                await api.put(
                    `/admin/ai-models/${editingId}`,
                    payload
                );

                setSuccess(
                    "AI model updated successfully."
                );
            } else {
                await api.post(
                    "/admin/ai-models",
                    payload
                );

                setSuccess(
                    "AI model added successfully."
                );
            }

            resetForm();
            await loadData();
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
                        "Unable to save the AI model."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (model) => {
        setEditingId(model.id);

        setForm({
            ai_provider_id:
                String(model.ai_provider_id),
            name: model.name || "",
            model_key:
                model.model_key || "",
            description:
                model.description || "",
            is_active:
                Boolean(model.is_active),
            is_default:
                Boolean(model.is_default),
            sort_order:
                model.sort_order ?? 0,
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (model) => {
        if (
            !window.confirm(
                `Delete "${model.name}"?`
            )
        ) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/admin/ai-models/${model.id}`
            );

            setSuccess(
                "AI model deleted successfully."
            );

            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to delete the AI model."
            );
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                        <Icon type="model" />
                        Administration
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        AI Models
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        Add and manage the image-generation models
                        available to your users.
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    {models.length}{" "}
                    {models.length === 1
                        ? "model"
                        : "models"}{" "}
                    configured
                </div>
            </section>

            {/* Alerts */}
            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 font-bold">
                        !
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

            {/* How it works */}
            <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                        <Icon type="info" />
                    </div>

                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Adding a new model
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Select an already supported provider, then enter
                            the exact model ID supplied by that provider.
                            No application code changes are required.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-lg bg-white px-3 py-2 text-indigo-600 shadow-sm">
                                1. Select Provider
                            </span>

                            <span className="text-indigo-300">
                                →
                            </span>

                            <span className="rounded-lg bg-white px-3 py-2 text-indigo-600 shadow-sm">
                                2. Enter Model ID
                            </span>

                            <span className="text-indigo-300">
                                →
                            </span>

                            <span className="rounded-lg bg-white px-3 py-2 text-indigo-600 shadow-sm">
                                3. Add Model
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                <Icon
                                    type={
                                        editingId
                                            ? "edit"
                                            : "plus"
                                    }
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    {editingId
                                        ? "Edit AI Model"
                                        : "Add AI Model"}
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    {editingId
                                        ? "Update the model configuration."
                                        : "Connect an available model to your platform."}
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
                    {providers.length === 0 ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                    <Icon type="info" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-amber-800">
                                        No AI provider available
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-amber-700">
                                        You need to configure an AI provider
                                        before adding a model.
                                    </p>

                                    <a
                                        href="/admin/providers"
                                        className="mt-3 inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                                    >
                                        Configure Provider
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Provider */}
                                <div>
                                    <label
                                        htmlFor="model-provider"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        AI Provider
                                    </label>

                                    <select
                                        id="model-provider"
                                        name="ai_provider_id"
                                        value={
                                            form.ai_provider_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                    >
                                        <option value="">
                                            Select a provider
                                        </option>

                                        {providers.map(
                                            (provider) => (
                                                <option
                                                    key={
                                                        provider.id
                                                    }
                                                    value={
                                                        provider.id
                                                    }
                                                >
                                                    {
                                                        provider.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <p className="mt-1.5 text-xs text-slate-400">
                                        Choose the AI service that provides
                                        this model.
                                    </p>
                                </div>

                                {/* Model Name */}
                                <div>
                                    <label
                                        htmlFor="model-name"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Model Name
                                    </label>

                                    <input
                                        id="model-name"
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="e.g. FLUX.1 Kontext"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                    />

                                    <p className="mt-1.5 text-xs text-slate-400">
                                        The friendly name users will see.
                                    </p>
                                </div>
                            </div>

                            {/* Model ID */}
                            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                        <Icon type="model" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            Model ID
                                        </h3>

                                        <p className="mt-1 text-sm leading-5 text-slate-500">
                                            Enter the exact identifier supplied
                                            by the AI provider.
                                        </p>
                                    </div>
                                </div>

                                <input
                                    id="model-key"
                                    name="model_key"
                                    value={
                                        form.model_key
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    placeholder="e.g. provider/model-id"
                                    className="mt-4 w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 font-mono text-sm text-slate-800 shadow-sm outline-none transition placeholder:font-sans placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />

                                <div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
                                    <span className="font-semibold text-indigo-500">
                                        Important:
                                    </span>

                                    <span>
                                        This must match the provider's model
                                        identifier exactly.
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <label
                                    htmlFor="model-description"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Description
                                    <span className="ml-1 font-normal text-slate-400">
                                        (optional)
                                    </span>
                                </label>

                                <textarea
                                    id="model-description"
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={3}
                                    placeholder="Describe what this model is best used for."
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Sort order */}
                            <div className="mt-6">
                                <label
                                    htmlFor="model-sort-order"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Display Order
                                </label>

                                <input
                                    id="model-sort-order"
                                    type="number"
                                    min="0"
                                    name="sort_order"
                                    value={
                                        form.sort_order
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:w-40"
                                />

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Lower numbers appear first in model
                                    selection.
                                </p>
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
                                            Active model
                                        </span>

                                        <span className="mt-1 block text-xs leading-5 text-slate-400">
                                            Make this model available to
                                            users.
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
                                            Default model
                                        </span>

                                        <span className="mt-1 block text-xs leading-5 text-slate-400">
                                            Use this model as the default
                                            selection.
                                        </span>
                                    </span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetForm
                                        }
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
                                                ? "Update Model"
                                                : "Add Model"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </section>

            {/* Configured models */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Configured Models
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Models currently available on the platform.
                        </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                        {models.length} configured
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4 p-6">
                        {[1, 2, 3].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="flex animate-pulse items-center gap-4"
                                >
                                    <div className="h-11 w-11 rounded-xl bg-slate-100" />

                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-40 rounded bg-slate-100" />
                                        <div className="h-3 w-64 rounded bg-slate-100" />
                                    </div>

                                    <div className="h-9 w-24 rounded bg-slate-100" />
                                </div>
                            )
                        )}
                    </div>
                ) : models.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Icon type="model" />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            No AI models configured
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Add your first model above to make it available
                            for image generation.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {models.map((model) => (
                            <div
                                key={model.id}
                                className="p-5 transition hover:bg-slate-50/60 sm:p-6"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                            <Icon type="model" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-slate-900">
                                                    {
                                                        model.name
                                                    }
                                                </h3>

                                                {model.is_default && (
                                                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                                                        Default
                                                    </span>
                                                )}

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                        model.is_active
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {model.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-xs text-slate-400">
                                                Provider:{" "}
                                                <strong className="font-medium text-slate-500">
                                                    {model
                                                        .ai_provider
                                                        ?.name ||
                                                        "Unknown"}
                                                </strong>
                                            </p>

                                            <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
                                                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Model ID
                                                </span>

                                                <p className="mt-0.5 break-all font-mono text-xs text-slate-600">
                                                    {
                                                        model.model_key
                                                    }
                                                </p>
                                            </div>

                                            {model.description && (
                                                <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-500">
                                                    {
                                                        model.description
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 lg:shrink-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(
                                                    model
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
                                                    model
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

export default AdminModels;