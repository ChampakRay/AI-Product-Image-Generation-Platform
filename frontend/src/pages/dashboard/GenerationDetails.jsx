import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";

function StatusBadge({ status }) {
    const styles = {
        completed: "bg-green-100 text-green-700",
        processing: "bg-yellow-100 text-yellow-700",
        pending: "bg-blue-100 text-blue-700",
        failed: "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
                styles[status] || "bg-gray-100 text-gray-600"
            }`}
        >
            {status}
        </span>
    );
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

    /*
     * Open the Generate page with the current
     * generation's settings pre-filled.
     */
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
                (generation.reference_images || []).map(
                    (image) => ({
                    path:
                        image.file_path ||
                        image.path,

                    original_filename:
                        image.original_filename,

                    mime_type:
                        image.mime_type,

                    size_bytes:
                        image.size_bytes,
                })
    ),
            },
        });
    };

    /*
     * Actually call the backend regeneration
     * endpoint.
     */
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
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-950">
                        Generation Details
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Loading generation...
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading generation details...
                    </p>
                </div>
            </div>
        );
    }

    if (isError || !generation) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-950">
                        Generation Details
                    </h1>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="font-medium text-red-700">
                        Unable to load this generation.
                    </p>

                    <p className="mt-2 text-sm text-red-600">
                        {error?.response?.data?.message ||
                            "Generation not found."}
                    </p>

                    <Link
                        to="/history"
                        className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Back to History
                    </Link>
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
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-950">
                            Generation Details
                        </h1>

                        <StatusBadge
                            status={generation.status}
                        />
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                        Generation #{generation.id}
                    </p>
                </div>

                <Link
                    to="/history"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                >
                    Back to History
                </Link>
            </div>

            {/* Main content */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                {/* Generated image */}
                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Generated Image
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Final output from your selected AI
                                model.
                            </p>
                        </div>

                        {isCompleted && (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                Saved to Gallery
                            </span>
                        )}
                    </div>

                    <div className="flex min-h-[500px] items-center justify-center bg-gray-50 p-5 sm:p-8">
                        {outputImageUrl &&
                        isCompleted ? (
                            <div className="w-full">
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
                                        className="rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-800"
                                    >
                                        Download Image
                                    </button>

                                    <a
                                        href={
                                            outputImageUrl
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                                    >
                                        Open Image
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-md text-center">
                                <div
                                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-xl shadow-sm ${
                                        isFailed
                                            ? "bg-red-50 text-red-600"
                                            : "bg-white text-gray-700"
                                    }`}
                                >
                                    {isFailed
                                        ? "!"
                                        : "..."}
                                </div>

                                <p className="mt-4 font-medium text-gray-800">
                                    {isFailed
                                        ? "Generation failed"
                                        : isProcessing
                                        ? "Generation is processing"
                                        : isPending
                                        ? "Generation is queued"
                                        : "No generated image available"}
                                </p>

                                <p className="mt-2 text-sm text-gray-500">
                                    {isPending
                                        ? "Your generation is waiting to be processed."
                                        : isProcessing
                                        ? "The AI model is currently generating your image."
                                        : isFailed
                                        ? "The image could not be generated."
                                        : "There is no generated image available for this generation."}
                                </p>

                                {generation.error_message && (
                                    <p className="mt-4 text-sm leading-6 text-red-600">
                                        {
                                            generation.error_message
                                        }
                                    </p>
                                )}

                                {(isPending ||
                                    isProcessing) && (
                                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                                        Updating automatically...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Information */}
                <div className="space-y-6">
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Generation Information
                        </h2>

                        <div className="mt-5 divide-y divide-gray-100">
                            <div className="flex justify-between gap-4 py-3">
                                <span className="text-sm text-gray-500">
                                    Status
                                </span>

                                <StatusBadge
                                    status={
                                        generation.status
                                    }
                                />
                            </div>

                            <div className="flex justify-between gap-4 py-3">
                                <span className="text-sm text-gray-500">
                                    Product
                                </span>

                                <span className="text-right text-sm font-medium text-gray-900">
                                    {generation.product
                                        ?.name ||
                                        "Unknown"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 py-3">
                                <span className="text-sm text-gray-500">
                                    AI Model
                                </span>

                                <span className="text-right text-sm font-medium text-gray-900">
                                    {aiModel?.name ||
                                        "Unknown"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 py-3">
                                <span className="text-sm text-gray-500">
                                    Provider
                                </span>

                                <span className="text-right text-sm font-medium text-gray-900">
                                    {aiProvider?.name ||
                                        "Unknown"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 py-3">
                                <span className="text-sm text-gray-500">
                                    Aspect Ratio
                                </span>

                                <span className="text-right text-sm font-medium text-gray-900">
                                    {generation.aspect_ratio ||
                                        "Not specified"}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 py-3">
                                <span className="text-sm text-gray-500">
                                    Output Quality
                                </span>

                                <span className="text-right text-sm font-medium capitalize text-gray-900">
                                    {generation.output_quality ||
                                        "High"}
                                </span>
                            </div>

                            {generation.generation_time_ms && (
                                <div className="flex justify-between gap-4 py-3">
                                    <span className="text-sm text-gray-500">
                                        Generation Time
                                    </span>

                                    <span className="text-right text-sm font-medium text-gray-900">
                                        {(
                                            generation.generation_time_ms /
                                            1000
                                        ).toFixed(1)}
                                        s
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between gap-4 py-3">
                                <span className="text-sm text-gray-500">
                                    Created
                                </span>

                                <span className="text-right text-sm font-medium text-gray-900">
                                    {new Date(
                                        generation.created_at
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Actions
                        </h2>

                        <div className="mt-4 space-y-3">
                            {isCompleted && (
                                <button
                                    type="button"
                                    onClick={
                                        handleDownload
                                    }
                                    className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                                >
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPending ||
                                isProcessing
                                    ? "Generation in progress..."
                                    : "Regenerate"}
                            </button>

                            <button
                                    type="button"
                                    onClick={handleEditPrompt}
                                    disabled={isPending || isProcessing}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Edit Prompt
                                </button>

                            <Link
                                to="/generate"
                                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                            >
                                Generate Another
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                                Delete Generation
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Prompt */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Prompt
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Prompt used to generate this image.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleEditPrompt}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                    >
                        Edit Prompt
                    </button>
                </div>

                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                        {generation.prompt}
                    </p>
                </div>
            </section>

            {/* Reference images */}
            {generation.reference_images?.length > 0 && (
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Reference Images
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Images used to guide this generation.
                        </p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {generation.reference_images.map(
                            (image) => (
                                <div
                                    key={image.id}
                                    className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                >
                                    <img
                                        src={`${BACKEND_URL}/storage/${image.file_path}`}
                                        alt={
                                            image.original_filename
                                        }
                                        className="aspect-square w-full object-cover"
                                    />

                                    <p className="truncate border-t border-gray-200 bg-white p-3 text-xs text-gray-600">
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