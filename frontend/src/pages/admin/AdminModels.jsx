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
        const { name, value, type, checked } =
            event.target;

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
                    Object.values(validationErrors)
                        .flat()[0];

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
            model_key: model.model_key || "",
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
        <div className="p-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    AI Models
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Add and manage the image-generation models
                    available to users.
                </p>
            </div>

            {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {editingId
                                ? "Edit AI Model"
                                : "Add AI Model"}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Add a model from an already supported
                            AI provider.
                        </p>
                    </div>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Provider
                        </label>

                        <select
                            name="ai_provider_id"
                            value={form.ai_provider_id}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
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
                                        {provider.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Model Name
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. FLUX.1 Kontext"
                                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Model ID
                            </label>

                            <input
                                name="model_key"
                                value={form.model_key}
                                onChange={handleChange}
                                required
                                placeholder="e.g. provider/model-id"
                                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Enter the exact model ID supplied
                                by the AI provider.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe what this model is used for."
                            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Sort Order
                        </label>

                        <input
                            type="number"
                            min="0"
                            name="sort_order"
                            value={form.sort_order}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black md:w-40"
                        />
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />

                            <span>
                                Active
                            </span>
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="is_default"
                                checked={form.is_default}
                                onChange={handleChange}
                            />

                            <span>
                                Set as default model
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            saving ||
                            providers.length === 0
                        }
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                              ? "Update Model"
                              : "Add Model"}
                    </button>

                    {providers.length === 0 && (
                        <p className="text-sm text-amber-600">
                            Add an AI provider before adding a
                            model.
                        </p>
                    )}
                </form>
            </div>

            <div className="mt-6 rounded-xl border bg-white shadow-sm">
                <div className="border-b p-6">
                    <h3 className="text-lg font-semibold">
                        Configured Models
                    </h3>
                </div>

                {loading ? (
                    <div className="p-6 text-sm text-gray-500">
                        Loading models...
                    </div>
                ) : models.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">
                        No AI models have been configured.
                    </div>
                ) : (
                    <div className="divide-y">
                        {models.map((model) => (
                            <div
                                key={model.id}
                                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="font-semibold text-gray-900">
                                            {model.name}
                                        </h4>

                                        {model.is_default && (
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                Default
                                            </span>
                                        )}

                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                model.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {model.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Provider:{" "}
                                        {model.ai_provider
                                            ?.name ||
                                            "Unknown"}
                                    </p>

                                    <p className="mt-1 break-all text-xs text-gray-400">
                                        Model ID:{" "}
                                        {model.model_key}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(
                                                model
                                            )
                                        }
                                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                model
                                            )
                                        }
                                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminModels;