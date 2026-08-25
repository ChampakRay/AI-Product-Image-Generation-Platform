import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL = "http://127.0.0.1:8000";

function Dashboard() {
    const {
        data: generations = [],
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

    const totalGenerations = generations.length;

    const completedGenerations = generations.filter(
        (generation) => generation.status === "completed"
    ).length;

    const failedGenerations = generations.filter(
        (generation) => generation.status === "failed"
    ).length;

    const processingGenerations = generations.filter(
        (generation) =>
            generation.status === "processing" ||
            generation.status === "pending"
    ).length;

    const recentGenerations = generations.slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome to AI Product Studio
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Generate high-quality product images using AI.
                    </p>
                </div>

                <Link
                    to="/generate"
                    className="rounded-lg bg-black px-5 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
                >
                    Generate New Image
                </Link>
            </div>

            {/* Error */}
            {isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error?.response?.data?.message ||
                        "Unable to load dashboard data."}
                </div>
            )}

            {/* Statistics */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Total Generations
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {isLoading ? "—" : totalGenerations}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Completed
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {isLoading ? "—" : completedGenerations}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Processing
                    </p>

                    <p className="mt-2 text-3xl font-bold text-yellow-600">
                        {isLoading ? "—" : processingGenerations}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500">
                        Failed
                    </p>

                    <p className="mt-2 text-3xl font-bold text-red-600">
                        {isLoading ? "—" : failedGenerations}
                    </p>
                </div>
            </div>

            {/* Recent Generations */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b p-6">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Recent Generations
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Your latest product image generations.
                        </p>
                    </div>

                    <Link
                        to="/history"
                        className="text-sm font-medium text-gray-700 hover:underline"
                    >
                        View All
                    </Link>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-sm text-gray-500">
                        Loading generations...
                    </div>
                ) : recentGenerations.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-medium text-gray-700">
                            No generations yet.
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Create your first product image to get
                            started.
                        </p>

                        <Link
                            to="/generate"
                            className="mt-5 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
                        >
                            Generate Image
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y">
                        {recentGenerations.map((generation) => {
                            const imageUrl =
                                generation.output_image_path
                                    ? `${BACKEND_URL}/storage/${generation.output_image_path}`
                                    : null;

                            return (
                                <div
                                    key={generation.id}
                                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={
                                                    generation.prompt
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                                No image
                                            </div>
                                        )}
                                    </div>

                                    {/* Information */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium">
                                                {generation.product
                                                    ?.name ||
                                                    "Product"}
                                            </p>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    generation.status ===
                                                    "completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : generation.status ===
                                                            "processing"
                                                          ? "bg-yellow-100 text-yellow-700"
                                                          : generation.status ===
                                                              "pending"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {generation.status}
                                            </span>
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                            {generation.prompt}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            {new Date(
                                                generation.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* View */}
                                    <Link
                                        to={`/generations/${generation.id}`}
                                        className="rounded-lg border px-4 py-2 text-center text-sm font-medium hover:bg-gray-50"
                                    >
                                        View
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Action */}
            <div className="rounded-xl bg-black p-8 text-white">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Ready to create something new?
                        </h2>

                        <p className="mt-2 text-sm text-gray-300">
                            Generate a professional product image from
                            a prompt and optional reference images.
                        </p>
                    </div>

                    <Link
                        to="/generate"
                        className="rounded-lg bg-white px-5 py-3 text-center text-sm font-semibold text-black hover:bg-gray-100"
                    >
                        Start Generating
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;