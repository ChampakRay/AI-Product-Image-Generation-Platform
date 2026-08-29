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
                    Object.values(validationErrors)
                        .flat()[0];

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
        <div className="p-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    AI Providers
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Configure the AI services used by the
                    image generation platform.
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
                                ? "Edit AI Provider"
                                : "Add AI Provider"}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Enter the provider details and API
                            key supplied by the AI service.
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
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Provider Name
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Hugging Face"
                                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Driver Key
                            </label>

                            <input
                                name="driver_key"
                                value={form.driver_key}
                                onChange={handleChange}
                                required
                                placeholder="e.g. huggingface"
                                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                This must match a provider
                                integration already supported
                                by the application.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            API Key
                        </label>

                        <input
                            type="password"
                            name="api_key"
                            value={form.api_key}
                            onChange={handleChange}
                            required={!editingId}
                            placeholder={
                                editingId
                                    ? "Leave empty to keep the existing key"
                                    : "Paste your API key here"
                            }
                            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            Your API key is stored on the server
                            and is not displayed after saving.
                        </p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Endpoint URL
                            <span className="ml-1 font-normal text-gray-400">
                                (optional)
                            </span>
                        </label>

                        <input
                            name="endpoint_url"
                            value={form.endpoint_url}
                            onChange={handleChange}
                            placeholder="https://api.example.com"
                            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
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
                                Set as default provider
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                              ? "Update Provider"
                              : "Add Provider"}
                    </button>
                </form>
            </div>

            <div className="mt-6 rounded-xl border bg-white shadow-sm">
                <div className="border-b p-6">
                    <h3 className="text-lg font-semibold">
                        Configured Providers
                    </h3>
                </div>

                {loading ? (
                    <div className="p-6 text-sm text-gray-500">
                        Loading providers...
                    </div>
                ) : providers.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500">
                        No AI providers have been configured.
                    </div>
                ) : (
                    <div className="divide-y">
                        {providers.map((provider) => (
                            <div
                                key={provider.id}
                                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="font-semibold text-gray-900">
                                            {provider.name}
                                        </h4>

                                        {provider.is_default && (
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                Default
                                            </span>
                                        )}

                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                provider.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {provider.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Driver:{" "}
                                        {provider.driver_key}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Models:{" "}
                                        {provider.ai_models_count ??
                                            0}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(
                                                provider
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
                                                provider
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

export default AdminProviders;