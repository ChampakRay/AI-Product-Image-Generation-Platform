import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL = "http://127.0.0.1:8000";

function StatusBadge({ status }) {
    const styles = {
        completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        processing: "bg-amber-50 text-amber-700 ring-amber-600/10",
        pending: "bg-blue-50 text-blue-700 ring-blue-600/10",
        failed: "bg-red-50 text-red-700 ring-red-600/10",
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
                    status === "completed"
                        ? "bg-emerald-500"
                        : status === "processing"
                          ? "bg-amber-500"
                          : status === "pending"
                            ? "bg-blue-500"
                            : status === "failed"
                              ? "bg-red-500"
                              : "bg-slate-400"
                }`}
            />

            {status}
        </span>
    );
}

function ImagePlaceholder({ generation }) {
    const isFailed = generation.status === "failed";

    return (
        <div className="flex h-full items-center justify-center bg-slate-50 p-6 text-center">
            <div>
                <div
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                        isFailed
                            ? "bg-red-50 text-red-500"
                            : "bg-white text-slate-400"
                    }`}
                >
                    {isFailed ? (
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v4" />
                            <path d="M12 16h.01" />
                        </svg>
                    ) : (
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
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
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                        </svg>
                    )}
                </div>

                <p
                    className={`mt-3 text-sm font-semibold ${
                        isFailed ? "text-red-600" : "text-slate-600"
                    }`}
                >
                    {isFailed
                        ? "Generation failed"
                        : "No image available"}
                </p>

                {generation.error_message && (
                    <p className="mx-auto mt-2 line-clamp-3 max-w-xs text-xs leading-5 text-slate-500">
                        {generation.error_message}
                    </p>
                )}

                {!isFailed && (
                    <p className="mt-1 text-xs text-slate-400">
                        The image may still be processing.
                    </p>
                )}
            </div>
        </div>
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
            <div className="space-y-8">
                <div>
                    <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
                    <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            <div className="aspect-square animate-pulse bg-slate-100" />

                            <div className="space-y-4 p-5">
                                <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
                                <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                                <div className="h-12 animate-pulse rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
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
                            <path d="M3 12a9 9 0 1 0 3-6.7" />
                            <path d="M3 4v5h5" />
                        </svg>

                        Your creations
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Generation History
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        View, manage, and revisit your generated product
                        images.
                    </p>
                </div>

                <Link
                    to="/generate"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
                        <path d="M19 16l.7 2.3L22 19l-2.3.7L19 16z" />
                    </svg>

                    Generate New Image
                </Link>
            </section>

            {/* Error */}
            {isError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <svg
                        className="mt-0.5 shrink-0"
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

                    <div>
                        <p className="font-semibold">
                            Unable to load generation history
                        </p>

                        <p className="mt-1 text-red-600">
                            {error?.response?.data?.message ||
                                "Please try again later."}
                        </p>
                    </div>
                </div>
            )}

            {/* Delete error */}
            {deleteMutation.isError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <svg
                        className="mt-0.5 shrink-0"
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

                    <div>
                        <p className="font-semibold">
                            Unable to delete generation
                        </p>

                        <p className="mt-1 text-red-600">
                            {deleteMutation.error?.response?.data?.message ||
                                "Please try again."}
                        </p>
                    </div>
                </div>
            )}

            {/* Summary */}
            {generations.length > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            Your generations
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {generations.length}{" "}
                            {generations.length === 1
                                ? "generation"
                                : "generations"}{" "}
                            in your history
                        </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                        {generations.length}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {generations.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
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
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                        </svg>
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-slate-900">
                        No generations yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Create your first AI product image and your completed
                        generations will appear here.
                    </p>

                    <Link
                        to="/generate"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
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
                            <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
                        </svg>

                        Create Your First Image
                    </Link>
                </div>
            ) : (
                /* Generation grid */
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {generations.map((generation) => {
                        const imageUrl = generation.output_image_path
                            ? `${BACKEND_URL}/storage/${generation.output_image_path}`
                            : null;

                        return (
                            <article
                                key={generation.id}
                                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                            >
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden bg-slate-100">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={
                                                generation.product?.name ||
                                                "Generated product image"
                                            }
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
                                        />
                                    ) : (
                                        <ImagePlaceholder
                                            generation={generation}
                                        />
                                    )}

                                    {/* Status */}
                                    <div className="absolute left-4 top-4">
                                        <StatusBadge
                                            status={generation.status}
                                        />
                                    </div>
                                </div>

                                {/* Card content */}
                                <div className="space-y-4 p-5">
                                    {/* Product + model */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="truncate text-sm font-semibold text-slate-900">
                                                {generation.product?.name ||
                                                    "Product"}
                                            </h2>

                                            <p className="mt-1 truncate text-xs text-slate-400">
                                                {generation.ai_model?.name ||
                                                    generation.aiModel?.name ||
                                                    generation.ai_provider
                                                        ?.name ||
                                                    "AI Model"}
                                            </p>
                                        </div>

                                        {generation.aspect_ratio && (
                                            <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                                                {generation.aspect_ratio}
                                            </span>
                                        )}
                                    </div>

                                    {/* Prompt */}
                                    <p className="line-clamp-3 text-sm leading-5 text-slate-500">
                                        {generation.prompt}
                                    </p>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <svg
                                            width="13"
                                            height="13"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="9" />
                                            <path d="M12 7v5l3 2" />
                                        </svg>

                                        {new Date(
                                            generation.created_at
                                        ).toLocaleString()}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 border-t border-slate-100 pt-4">
                                        <Link
                                            to={`/generations/${generation.id}`}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                        >
                                            View Details

                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="m9 18 6-6-6-6" />
                                            </svg>
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(generation.id)
                                            }
                                            disabled={
                                                deleteMutation.isPending
                                            }
                                            className="rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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