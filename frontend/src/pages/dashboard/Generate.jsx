import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Generate() {
    const navigate = useNavigate();
    const location = useLocation();

    /*
     * Read navigation state once when the component is created.
     * This supports Edit Prompt / Regenerate without using
     * synchronous setState calls inside useEffect.
     */
    const navigationState = location.state || {};

    const [products, setProducts] = useState([]);
    const [models, setModels] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(
        navigationState.productId
            ? String(navigationState.productId)
            : ""
    );

    const [selectedModel, setSelectedModel] = useState("");

    const [prompt, setPrompt] = useState(
        navigationState.prompt || ""
    );

    const [aspectRatio, setAspectRatio] = useState(
        navigationState.aspectRatio || "1:1"
    );

    const [outputQuality, setOutputQuality] = useState(
        navigationState.outputQuality || "high"
    );

    const [referenceImages, setReferenceImages] =
        useState([]);

    const [generation, setGeneration] = useState(null);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
     * Load products and AI models.
     */
    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    productsResponse,
                    modelsResponse,
                ] = await Promise.all([
                    api.get("/products"),
                    api.get("/ai-models"),
                ]);

                if (cancelled) {
                    return;
                }

                const productsData =
                    productsResponse.data.data;

                const modelsData =
                    modelsResponse.data.data;

                setProducts(
                    Array.isArray(productsData)
                        ? productsData
                        : productsData?.data || []
                );

                setModels(
                    Array.isArray(modelsData)
                        ? modelsData
                        : modelsData?.data || []
                );
            } catch (loadError) {
                console.error(
                    "Failed to load generation data:",
                    loadError
                );

                if (!cancelled) {
                    setError(
                        loadError.response?.data?.message ||
                            "Unable to load products and AI models."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * Poll the generation while it is pending
     * or processing.
     */
    useEffect(() => {
        if (!generation?.id) {
            return;
        }

        if (
            generation.status !== "pending" &&
            generation.status !== "processing"
        ) {
            return;
        }

        let cancelled = false;
        let timer = null;

        const pollGeneration = async () => {
            try {
                const response = await api.get(
                    `/generations/${generation.id}`
                );

                if (cancelled) {
                    return;
                }

                const latestGeneration =
                    response.data.data;

                setGeneration(latestGeneration);

                if (
                    latestGeneration.status ===
                    "completed"
                ) {
                    setGenerating(false);
                    setError("");
                    setSuccess(
                        "Image generation completed successfully."
                    );

                    return;
                }

                if (
                    latestGeneration.status ===
                    "failed"
                ) {
                    setGenerating(false);
                    setSuccess("");
                    setError(
                        latestGeneration.error_message ||
                            "Image generation failed."
                    );

                    return;
                }

                timer = setTimeout(
                    pollGeneration,
                    3000
                );
            } catch (pollError) {
                console.error(
                    "Generation status polling failed:",
                    pollError
                );

                if (!cancelled) {
                    timer = setTimeout(
                        pollGeneration,
                        5000
                    );
                }
            }
        };

        timer = setTimeout(
            pollGeneration,
            2000
        );

        return () => {
            cancelled = true;

            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [
        generation?.id,
        generation?.status,
    ]);

    const currentModel = useMemo(() => {
        return models.find(
            (model) =>
                String(model.id) ===
                String(selectedModel)
        );
    }, [models, selectedModel]);

    const currentProduct = useMemo(() => {
        return products.find(
            (product) =>
                String(product.id) ===
                String(selectedProduct)
        );
    }, [products, selectedProduct]);

    /*
     * Upload reference images.
     */
    const handleReferenceImages = async (event) => {
        const files = Array.from(
            event.target.files || []
        );

        if (!files.length) {
            return;
        }

        setError("");
        setSuccess("");

        /*
         * Maximum 16 reference images.
         */
        const remainingSlots =
            16 - referenceImages.length;

        if (remainingSlots <= 0) {
            setError(
                "You can upload a maximum of 16 reference images."
            );

            event.target.value = "";
            return;
        }

        const filesToUpload = files.slice(
            0,
            remainingSlots
        );

        if (files.length > remainingSlots) {
            setError(
                `You can only add ${remainingSlots} more reference image${
                    remainingSlots === 1
                        ? ""
                        : "s"
                }.`
            );
        }

        const validFiles = filesToUpload.filter(
            (file) => {
                const validType = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                ].includes(file.type);

                const validSize =
                    file.size <=
                    10 * 1024 * 1024;

                return (
                    validType &&
                    validSize
                );
            }
        );

        if (
            validFiles.length !==
            filesToUpload.length
        ) {
            setError(
                "Only JPG, PNG, or WEBP images up to 10MB are allowed."
            );
        }

        if (!validFiles.length) {
            event.target.value = "";
            return;
        }

        try {
            const uploadedImages = [];

            for (const file of validFiles) {
                const formData = new FormData();

                formData.append(
                    "image",
                    file
                );

                const response =
                    await api.post(
                        "/uploads/reference-image",
                        formData,
                        {
                            headers: {
                                "Content-Type":
                                    "multipart/form-data",
                            },
                        }
                    );

                const image =
                    response.data.data;

                uploadedImages.push(image);
            }

            setReferenceImages(
                (previous) => [
                    ...previous,
                    ...uploadedImages,
                ]
            );

            if (
                uploadedImages.length > 0
            ) {
                setError("");
                setSuccess(
                    `${uploadedImages.length} reference image${
                        uploadedImages.length ===
                        1
                            ? ""
                            : "s"
                    } added successfully.`
                );
            }
        } catch (uploadError) {
            console.error(
                "Reference image upload failed:",
                uploadError
            );

            setError(
                uploadError.response?.data
                    ?.message ||
                    "Unable to upload reference image."
            );
        }

        event.target.value = "";
    };

    /*
     * Remove reference image.
     */
    const removeReferenceImage = (
        index
    ) => {
        setReferenceImages(
            (previous) =>
                previous.filter(
                    (_, imageIndex) =>
                        imageIndex !== index
                )
        );
    };

    /*
     * Generate image.
     */
    const handleGenerate = async (
        event
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setGeneration(null);

        if (!selectedProduct) {
            setError(
                "Please select a product."
            );
            return;
        }

        if (!selectedModel) {
            setError(
                "Please select an AI model."
            );
            return;
        }

        if (!prompt.trim()) {
            setError(
                "Please enter a prompt."
            );
            return;
        }

        if (!referenceImages.length) {
            setError(
                "Please upload at least one reference image."
            );
            return;
        }

        try {
            setGenerating(true);

            const response =
                await api.post(
                    "/generations",
                    {
                        product_id:
                            Number(
                                selectedProduct
                            ),

                        ai_model_id:
                            Number(
                                selectedModel
                            ),

                        prompt:
                            prompt.trim(),

                        aspect_ratio:
                            aspectRatio,

                        output_quality:
                            outputQuality,

                        reference_images:
                            referenceImages.map(
                                (image) => ({
                                    path:
                                        image.path,

                                    original_filename:
                                        image.original_filename,

                                    mime_type:
                                        image.mime_type,

                                    size_bytes:
                                        image.size_bytes,
                                })
                            ),
                    }
                );

            const createdGeneration =
                response.data.data;

            setGeneration(
                createdGeneration
            );

            if (
                createdGeneration.status ===
                "completed"
            ) {
                setGenerating(false);

                setSuccess(
                    "Image generation completed successfully."
                );
            } else if (
                createdGeneration.status ===
                "failed"
            ) {
                setGenerating(false);

                setError(
                    createdGeneration.error_message ||
                        "Image generation failed."
                );
            } else {
                setSuccess(
                    "Generation queued successfully."
                );
            }
        } catch (generationError) {
            console.error(
                "Generation failed:",
                generationError
            );

            setGenerating(false);

            setError(
                generationError.response?.data
                    ?.error ||
                    generationError.response?.data
                        ?.message ||
                    "Unable to create generation."
            );
        }
    };

    /*
     * Output quality description.
     */
    const qualityDescription =
        useMemo(() => {
            if (
                outputQuality ===
                "standard"
            ) {
                return {
                    title:
                        "Standard quality",
                    description:
                        "Faster generation with optimized resolution.",
                };
            }

            if (
                outputQuality ===
                "high"
            ) {
                return {
                    title:
                        "High quality",
                    description:
                        "Higher-quality output with resolution matched to your reference image where supported.",
                };
            }

            return {
                title:
                    "Ultra / 4K",
                description:
                    "AI upscaling will be available in a future version.",
            };
        }, [outputQuality]);

    /*
     * Generated image URL.
     */
    const generationImageUrl =
        generation?.output_image_path
            ? `http://127.0.0.1:8000/storage/${generation.output_image_path}`
            : null;

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl">
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading generation options...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-950">
                    Generate Product Image
                </h1>

                <p className="mt-2 text-gray-600">
                    Create professional product
                    imagery using AI.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                {/* Main form */}
                <form
                    onSubmit={
                        handleGenerate
                    }
                    className="space-y-6"
                >
                    {/* Product */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Product
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Choose the product you
                            want to generate an
                            image for.
                        </p>

                        <select
                            value={
                                selectedProduct
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedProduct(
                                    event
                                        .target
                                        .value
                                )
                            }
                            disabled={
                                generating
                            }
                            className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                            <option value="">
                                Select a product
                            </option>

                            {products.map(
                                (
                                    product
                                ) => (
                                    <option
                                        key={
                                            product.id
                                        }
                                        value={
                                            product.id
                                        }
                                    >
                                        {
                                            product.name
                                        }
                                    </option>
                                )
                            )}
                        </select>

                        {currentProduct?.description && (
                            <p className="mt-2 text-xs text-gray-500">
                                {
                                    currentProduct.description
                                }
                            </p>
                        )}
                    </section>

                    {/* Prompt */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Prompt
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Describe the product image
                            you want the AI to create.
                        </p>

                        <textarea
                            value={prompt}
                            onChange={(
                                event
                            ) =>
                                setPrompt(
                                    event
                                        .target
                                        .value
                                )
                            }
                            disabled={
                                generating
                            }
                            rows={6}
                            maxLength={5000}
                            placeholder="Describe the desired product image..."
                            className="mt-4 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                        />

                        <div className="mt-2 flex justify-end">
                            <span className="text-xs text-gray-400">
                                {
                                    prompt.length
                                }
                                /5000
                            </span>
                        </div>
                    </section>

                    {/* Product & Image Settings */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Product &amp; Image
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure the image that
                            should be generated.
                        </p>

                        {/* Aspect Ratio */}
                        <div className="mt-5">
                            <label className="block text-sm font-medium text-gray-900">
                                Aspect Ratio
                            </label>

                            <div className="mt-3 grid grid-cols-3 gap-3">
                                {[
                                    "1:1",
                                    "16:9",
                                    "9:16",
                                ].map(
                                    (
                                        ratio
                                    ) => (
                                        <button
                                            key={
                                                ratio
                                            }
                                            type="button"
                                            onClick={() =>
                                                setAspectRatio(
                                                    ratio
                                                )
                                            }
                                            disabled={
                                                generating
                                            }
                                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                                                aspectRatio ===
                                                ratio
                                                    ? "border-black bg-black text-white"
                                                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                                            } disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                            {
                                                ratio
                                            }
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Reference Images */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Reference Image
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Use an existing image
                                    to guide the
                                    generation.
                                </p>
                            </div>

                            <span className="text-xs text-gray-400">
                                {
                                    referenceImages.length
                                }{" "}
                                added
                            </span>
                        </div>

                        <div className="mt-4">
                            <label
                                htmlFor="reference-images"
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-gray-500 ${
                                    generating
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600">
                                    +
                                </div>

                                <p className="mt-3 text-sm font-medium text-gray-700">
                                    Add reference
                                    image
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    JPG, PNG or WebP
                                </p>

                                <input
                                    id="reference-images"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={
                                        handleReferenceImages
                                    }
                                    className="hidden"
                                    disabled={
                                        generating
                                    }
                                />
                            </label>
                        </div>

                        {referenceImages.length >
                            0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {referenceImages.map(
                                    (
                                        image,
                                        index
                                    ) => (
                                        <div
                                            key={`${image.path}-${index}`}
                                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                        >
                                            <img
                                                src={`http://127.0.0.1:8000/storage/${image.path}`}
                                                alt={
                                                    image.original_filename ||
                                                    "Reference image"
                                                }
                                                className="aspect-square w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeReferenceImage(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    generating
                                                }
                                                className="absolute right-2 top-2 rounded-full bg-black/75 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </section>

                    {/* AI Model */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            AI Model
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Choose which image generation
                            model should process your
                            request.
                        </p>

                        <label
                            htmlFor="ai-model"
                            className="mt-4 block text-sm font-medium text-gray-900"
                        >
                            Model
                        </label>

                        <select
                            id="ai-model"
                            value={
                                selectedModel
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedModel(
                                    event
                                        .target
                                        .value
                                )
                            }
                            disabled={
                                generating
                            }
                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                            <option value="">
                                Select an AI model
                            </option>

                            {models.map(
                                (model) => (
                                    <option
                                        key={
                                            model.id
                                        }
                                        value={
                                            model.id
                                        }
                                    >
                                        {
                                            model.name
                                        }
                                    </option>
                                )
                            )}
                        </select>

                        {currentModel && (
                            <div className="mt-4 rounded-xl border border-gray-200 p-4">
                                <p className="text-sm font-medium text-gray-900">
                                    {
                                        currentModel.name
                                    }
                                </p>

                                {currentModel.provider && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {
                                            currentModel.provider
                                        }
                                    </p>
                                )}

                                {currentModel.description && (
                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                        {
                                            currentModel.description
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Output Quality */}
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <label
                                htmlFor="output-quality"
                                className="block text-sm font-semibold text-gray-900"
                            >
                                Output Quality
                            </label>

                            <p className="mt-1 text-xs text-gray-500">
                                Choose the quality and
                                resolution of your
                                generated image.
                            </p>

                            <select
                                id="output-quality"
                                value={
                                    outputQuality
                                }
                                onChange={(
                                    event
                                ) =>
                                    setOutputQuality(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    generating
                                }
                                className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="standard">
                                    Standard — Fast &amp;
                                    Optimized
                                </option>

                                <option value="high">
                                    High Quality —
                                    Recommended
                                </option>

                                <option
                                    value="ultra"
                                    disabled
                                >
                                    Ultra / 4K —
                                    Coming Soon
                                </option>
                            </select>

                            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold text-gray-700">
                                    {
                                        qualityDescription.title
                                    }
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    {
                                        qualityDescription.description
                                    }
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Generate */}
                    <button
                        type="submit"
                        disabled={
                            generating ||
                            !selectedProduct ||
                            !selectedModel ||
                            !prompt.trim() ||
                            !referenceImages.length
                        }
                        className="w-full rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        {generating
                            ? "Generating..."
                            : "✨ Generate Image"}
                    </button>
                </form>

                {/* Generation Result */}
                <aside className="lg:sticky lg:top-6 lg:self-start">
                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-5 py-4">
                            <h2 className="font-semibold text-gray-900">
                                Generated Image
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Final output from your
                                selected AI model.
                            </p>
                        </div>

                        <div className="flex min-h-[420px] items-center justify-center bg-gray-50 p-5">
                            {generationImageUrl &&
                            generation?.status ===
                                "completed" ? (
                                <div className="w-full">
                                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                        <img
                                            src={
                                                generationImageUrl
                                            }
                                            alt="Generated product"
                                            className="max-h-[500px] w-full object-contain"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/generations/${generation.id}`
                                            )
                                        }
                                        className="mt-4 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                                    >
                                        View Generation
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                                        {generation?.status ===
                                        "failed"
                                            ? "!"
                                            : generating
                                            ? "..."
                                            : "✦"}
                                    </div>

                                    <p className="mt-4 text-sm font-medium text-gray-700">
                                        {generation?.status ===
                                        "failed"
                                            ? "Generation failed"
                                            : generation?.status ===
                                              "processing"
                                            ? "Generating your image..."
                                            : generation?.status ===
                                              "pending"
                                            ? "Generation queued..."
                                            : "Ready to generate"}
                                    </p>

                                    <p className="mt-2 max-w-xs text-xs leading-5 text-gray-500">
                                        {generation?.status ===
                                        "failed"
                                            ? generation.error_message ||
                                              "The image could not be generated."
                                            : generation?.status ===
                                              "processing"
                                            ? "The AI model is processing your request. This page will update automatically."
                                            : generation?.status ===
                                              "pending"
                                            ? "Your request is waiting for the queue worker."
                                            : "Select your options and generate a product image."}
                                    </p>

                                    {(generation?.status ===
                                        "pending" ||
                                        generation?.status ===
                                            "processing") && (
                                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />

                                            Updating
                                            automatically...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {generation && (
                            <div className="border-t border-gray-200 px-5 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {currentModel?.name ||
                                                "AI Model"}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Quality:{" "}
                                            {generation.output_quality ||
                                                outputQuality}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Aspect Ratio:{" "}
                                            {generation.aspect_ratio ||
                                                aspectRatio}
                                        </p>

                                        {generation.status ===
                                            "completed" &&
                                            generation.generation_time_ms && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Generation
                                                    time:{" "}
                                                    {(
                                                        generation.generation_time_ms /
                                                        1000
                                                    ).toFixed(
                                                        1
                                                    )}
                                                    s
                                                </p>
                                            )}
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            generation.status ===
                                            "completed"
                                                ? "bg-green-100 text-green-700"
                                                : generation.status ===
                                                  "failed"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                                        {
                                            generation.status
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
}

export default Generate;