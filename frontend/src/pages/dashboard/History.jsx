import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL = "http://127.0.0.1:8000";

function StatusBadge({ status }) {
    const styles = {
        completed: "bg-green-100 text-green-700",
        processing: "bg-yellow-100 text-yellow-700",
        pending: "bg-blue-100 text-blue-700",
        failed: "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                styles[status] || "bg-gray-100 text-gray-600"
            }`}
        >
            {status}
        </span>
    );
}

function History() {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["generations"],

        queryFn: async () => {
            const response = await api.get("/generations");

            return response.data.data?.data || [];
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (generationId) => {
            await api.delete(`/generations/${generationId}`);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["generations"],
            });
        },
    });

    const generations = data || [];

    const handleDelete = (generationId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this generation?"
        );

        if (!confirmed) {
            return;
        }

        deleteMutation.mutate(generationId);
    };

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-950">
                        Generation History
                    </h1>

                    <p className="mt-2 text-gray-600">
                        View and manage your generated product images.
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading generation history...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-950">
                        Generation History
                    </h1>

                    <p className="mt-2 text-gray-600">
                        View and manage your generated product images.
                    </p>
                </div>

                <Link
                    to="/generate"
                    className="rounded-lg bg-black px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    Generate New Image
                </Link>
            </div>

            {/* Errors */}
            {isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error?.response?.data?.message ||
                        "Unable to load generation history."}
                </div>
            )}

            {deleteMutation.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {deleteMutation.error?.response?.data?.message ||
                        "Unable to delete generation."}
                </div>
            )}

            {/* Empty state */}
            {generations.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                        ✨
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-gray-900">
                        No generations yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        Create your first AI product image to see it here.
                    </p>

                    <Link
                        to="/generate"
                        className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Create Your First Image
                    </Link>
                </div>
            ) : (
                /* Generation grid */
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {generations.map((generation) => {
                        const imageUrl =
                            generation.output_image_path
                                ? `${BACKEND_URL}/storage/${generation.output_image_path}`
                                : null;

                        return (
                            <article
                                key={generation.id}
                                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={
                                                generation.prompt ||
                                                "Generated product image"
                                            }
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center p-6 text-center">
                                            <div>
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                                                    {generation.status ===
                                                    "failed"
                                                        ? "!"
                                                        : "..."}
                                                </div>

                                                <p className="mt-3 font-medium text-gray-700">
                                                    {generation.status ===
                                                    "failed"
                                                        ? "Generation failed"
                                                        : "No image available"}
                                                </p>

                                                {generation.error_message && (
                                                    <p className="mt-2 line-clamp-3 text-xs text-gray-500">
                                                        {
                                                            generation.error_message
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status overlay */}
                                    <div className="absolute left-3 top-3">
                                        <StatusBadge
                                            status={
                                                generation.status
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Card content */}
                                <div className="space-y-4 p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="truncate text-sm font-semibold text-gray-900">
                                                {generation
                                                    .product?.name ||
                                                    "Product"}
                                            </h2>

                                            <p className="mt-1 truncate text-xs text-gray-400">
                                                {generation
                                                    .ai_model?.name ||
                                                    generation
                                                        .aiModel
                                                        ?.name ||
                                                    generation
                                                        .ai_provider
                                                        ?.name ||
                                                    "AI Model"}
                                            </p>
                                        </div>

                                        {generation.aspect_ratio && (
                                            <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500">
                                                {
                                                    generation.aspect_ratio
                                                }
                                            </span>
                                        )}
                                    </div>

                                    <p className="line-clamp-3 text-sm leading-5 text-gray-600">
                                        {generation.prompt}
                                    </p>

                                    <div className="text-xs text-gray-400">
                                        {new Date(
                                            generation.created_at
                                        ).toLocaleString()}
                                    </div>

                                    <div className="flex gap-2 border-t border-gray-100 pt-4">
                                        <Link
                                            to={`/generations/${generation.id}`}
                                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                                        >
                                            View Details
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    generation.id
                                                )
                                            }
                                            disabled={
                                                deleteMutation.isPending
                                            }
                                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {deleteMutation.isPending
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default History;