import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
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

            {status}
        </span>
    );
}

function ActionIcon({ type }) {
    const common = {
        width: 16,
        height: 16,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    if (type === "download") {
        return (
            <svg {...common}>
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
            </svg>
        );
    }

    if (type === "regenerate") {
        return (
            <svg {...common}>
                <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                <path d="M4 4v5h5" />
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                <path d="M20 20v-5h-5" />
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

    if (type === "external") {
        return (
            <svg {...common}>
                <path d="M14 4h6v6" />
                <path d="m20 4-9 9" />
                <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
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

    return null;
}

function GenerationDetails() {
    const { generationId } = useParams();
    const navigate = useNavigate();

    const {
        data: generation,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["generation", generationId],

        queryFn: async () => {
            const response = await api.get(
                `/generations/${generationId}`
            );

            return response.data.data;
        },

        enabled: Boolean(generationId),

        refetchInterval: (query) => {
            const status = query.state.data?.status;

            if (
                status === "pending" ||
                status === "processing"
            ) {
                return 3000;
            }

            return false;
        },
    });

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this generation?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/generations/${generationId}`
            );

            navigate("/history");
        } catch (deleteError) {
            window.alert(
                deleteError.response?.data?.message ||
                    "Unable to delete generation."
            );
        }
    };

    const handleDownload = async () => {
        try {
            const response = await api.get(
                `/generations/${generationId}/download`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob(
                [response.data],
                {
                    type:
                        response.headers[
                            "content-type"
                        ] || "image/png",
                }
            );

            const downloadUrl =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = downloadUrl;

            const contentType =
                response.headers[
                    "content-type"
                ] || "";

            let extension = "png";

            if (
                contentType.includes("jpeg") ||
                contentType.includes("jpg")
            ) {
                extension = "jpg";
            } else if (
                contentType.includes("webp")
            ) {
                extension = "webp";
            }

            link.download =
                `generation-${generationId}.${extension}`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                downloadUrl
            );
        } catch (downloadError) {
            console.error(
                "Download failed:",
                downloadError
            );

            window.alert(
                downloadError.response?.data?.message ||
                    "Unable to download the generated image."
            );
        }
    };

    const handleEditPrompt = () => {
        navigate("/generate", {
            state: {
                editGenerationId:
                    generation.id,

                prompt:
                    generation.prompt || "",

                productId:
                    generation.product_id,

                modelId:
                    generation.ai_model_id,

                aspectRatio:
                    generation.aspect_ratio ||
                    "1:1",

                outputQuality:
                    generation.output_quality ||
                    "high",

                referenceImages:
                    (
                        generation.reference_images ||
                        []
                    ).map((image) => ({
                        path:
                            image.file_path ||
                            image.path,

                        original_filename:
                            image.original_filename,

                        mime_type:
                            image.mime_type,

                        size_bytes:
                            image.size_bytes,
                    })),
            },
        });
    };

    const handleRegenerate = async () => {
        const confirmed = window.confirm(
            "Regenerate this image using the same prompt, model, settings, and reference images?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await api.post(
                `/generations/${generation.id}/regenerate`
            );

            const newGeneration =
                response.data.data;

            if (!newGeneration?.id) {
                throw new Error(
                    "The regenerated generation was not returned by the server."
                );
            }

            navigate(
                `/generations/${newGeneration.id}`
            );
        } catch (regenerateError) {
            console.error(
                "Regeneration failed:",
                regenerateError
            );

            window.alert(
                regenerateError.response?.data
                    ?.error ||
                    regenerateError.response?.data
                        ?.message ||
                    "Unable to regenerate this image."
            );
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="animate-pulse">
                    <div className="h-8 w-56 rounded-lg bg-slate-200" />
                    <div className="mt-3 h-4 w-32 rounded bg-slate-200" />
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="aspect-square animate-pulse rounded-2xl bg-slate-200 lg:aspect-auto lg:min-h-[600px]" />

                    <div className="space-y-6">
                        <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
                        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !generation) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Generation Details
                    </h1>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
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
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v4" />
                                <path d="M12 16h.01" />
                            </svg>
                        </div>

                        <div>
                            <p className="font-semibold text-red-700">
                                Unable to load this generation
                            </p>

                            <p className="mt-1 text-sm leading-6 text-red-600">
                                {error?.response?.data?.message ||
                                    "Generation not found."}
                            </p>

                            <Link
                                to="/history"
                                className="mt-4 inline-flex items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Back to History
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const outputImageUrl =
        generation.output_image_path
            ? `${BACKEND_URL}/storage/${generation.output_image_path}`
            : null;

    const aiModel =
        generation.ai_model ||
        generation.aiModel ||
        null;

    const aiProvider =
        generation.ai_provider ||
        generation.aiProvider ||
        null;

    const isCompleted =
        generation.status === "completed";

    const isProcessing =
        generation.status === "processing";

    const isPending =
        generation.status === "pending";

    const isFailed =
        generation.status === "failed";

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Generation Details
                        </h1>

                        <StatusBadge
                            status={
                                generation.status
                            }
                        />
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                        Generation #{generation.id}
                    </p>
                </div>

                <Link
                    to="/history"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>

                    Back to History
                </Link>
            </section>

            {/* Main */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                {/* Image */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Generated Image
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Final output from your selected AI
                                model.
                            </p>
                        </div>

                        {isCompleted && (
                            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Saved to Gallery
                            </span>
                        )}
                    </div>

                    <div className="flex min-h-[500px] items-center justify-center bg-slate-50 p-5 sm:min-h-[600px] sm:p-8">
                        {outputImageUrl &&
                        isCompleted ? (
                            <div className="w-full">
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <img
                                        src={
                                            outputImageUrl
                                        }
                                        alt="Generated product"
                                        className="mx-auto max-h-[700px] w-full object-contain"
                                    />
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={
                                            handleDownload
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <ActionIcon type="download" />
                                        Download Image
                                    </button>

                                    <a
                                        href={
                                            outputImageUrl
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        <ActionIcon type="external" />
                                        Open Image
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-md text-center">
                                <div
                                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                                        isFailed
                                            ? "bg-red-50 text-red-500"
                                            : "bg-white text-slate-400"
                                    }`}
                                >
                                    {isFailed ? (
                                        <svg
                                            width="28"
                                            height="28"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                            />
                                            <path d="M12 8v4" />
                                            <path d="M12 16h.01" />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="28"
                                            height="28"
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
                                            <circle
                                                cx="8.5"
                                                cy="8.5"
                                                r="1.5"
                                            />
                                            <path d="m21 15-5-5L5 21" />
                                        </svg>
                                    )}
                                </div>

                                <h3 className="mt-5 text-base font-semibold text-slate-800">
                                    {isFailed
                                        ? "Generation failed"
                                        : isProcessing
                                          ? "Generation is processing"
                                          : isPending
                                            ? "Generation is queued"
                                            : "No generated image available"}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {isPending
                                        ? "Your generation is waiting to be processed."
                                        : isProcessing
                                          ? "The AI model is currently generating your image."
                                          : isFailed
                                            ? "The image could not be generated."
                                            : "There is no generated image available for this generation."}
                                </p>

                                {generation.error_message && (
                                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-left">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                                            Error
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-red-600">
                                            {
                                                generation.error_message
                                            }
                                        </p>
                                    </div>
                                )}

                                {(isPending ||
                                    isProcessing) && (
                                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-400 shadow-sm">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                                        Updating automatically...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Information */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Generation Information
                        </h2>

                        <div className="mt-5 divide-y divide-slate-100">
                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-slate-500">
                                    Status
                                </span>

                                <StatusBadge
                                    status={
                                        generation.status
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-slate-500">
                                    Product
                                </span>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {generation.product
                                        ?.name ||
                                        "Unknown"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-slate-500">
                                    AI Model
                                </span>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {aiModel?.name ||
                                        "Unknown"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-slate-500">
                                    Provider
                                </span>

                                <span className="text-right text-sm font-semibold text-slate-800">
                                    {aiProvider?.name ||
                                        "Unknown"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-slate-500">
                                    Aspect Ratio
                                </span>

                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    {generation.aspect_ratio ||
                                        "Not specified"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-slate-500">
                                    Quality
                                </span>

                                <span className="text-sm font-semibold capitalize text-slate-800">
                                    {generation.output_quality ||
                                        "High"}
                                </span>
                            </div>

                            {generation.generation_time_ms && (
                                <div className="flex items-center justify-between gap-4 py-3">
                                    <span className="text-sm text-slate-500">
                                        Generation Time
                                    </span>

                                    <span className="text-sm font-semibold text-slate-800">
                                        {(
                                            generation.generation_time_ms /
                                            1000
                                        ).toFixed(1)}
                                        s
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 py-3">
                                <span className="text-sm text-slate-500">
                                    Created
                                </span>

                                <span className="text-right text-xs font-medium text-slate-600">
                                    {new Date(
                                        generation.created_at
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Actions
                        </h2>

                        <div className="mt-4 space-y-2.5">
                            {isCompleted && (
                                <button
                                    type="button"
                                    onClick={
                                        handleDownload
                                    }
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    <ActionIcon type="download" />
                                    Download Image
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={
                                    handleRegenerate
                                }
                                disabled={
                                    isPending ||
                                    isProcessing
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ActionIcon type="regenerate" />

                                {isPending ||
                                isProcessing
                                    ? "Generation in progress..."
                                    : "Regenerate"}
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleEditPrompt
                                }
                                disabled={
                                    isPending ||
                                    isProcessing
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ActionIcon type="edit" />
                                Edit Prompt
                            </button>

                            <Link
                                to="/generate"
                                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Generate Another
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                                <ActionIcon type="delete" />
                                Delete Generation
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Prompt */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Prompt
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Prompt used to generate this image.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            handleEditPrompt
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        <ActionIcon type="edit" />
                        Edit Prompt
                    </button>
                </div>

                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                        {generation.prompt}
                    </p>
                </div>
            </section>

            {/* Reference Images */}
            {generation.reference_images?.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Reference Images
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Images used to guide this generation.
                        </p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {generation.reference_images.map(
                            (image) => (
                                <div
                                    key={image.id}
                                    className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                                >
                                    <div className="aspect-square overflow-hidden">
                                        <img
                                            src={`${BACKEND_URL}/storage/${image.file_path}`}
                                            alt={
                                                image.original_filename
                                            }
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    <p className="truncate border-t border-slate-100 bg-white p-3 text-xs font-medium text-slate-500">
                                        {
                                            image.original_filename
                                        }
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}

export default GenerationDetails;