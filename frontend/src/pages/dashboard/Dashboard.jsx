function Dashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome to AI Product Studio
                </h1>

                <p className="mt-2 text-gray-600">
                    Generate high-quality product images using AI.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border bg-white p-6">
                    <h2 className="font-semibold">
                        Recent Generations
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        No generations yet.
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6">
                    <h2 className="font-semibold">
                        Usage Summary
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Usage information will appear here.
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6">
                    <h2 className="font-semibold">
                        Generate New
                    </h2>

                    <button
                        type="button"
                        className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                    >
                        Generate Product Image
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;