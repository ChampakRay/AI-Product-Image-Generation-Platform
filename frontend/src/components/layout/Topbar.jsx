import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function Topbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
    };

    const getPageInfo = () => {
        const path = location.pathname;

        if (path === "/dashboard") {
            return {
                title: "Dashboard",
                description: "Overview of your AI image workspace",
            };
        }

        if (path === "/generate") {
            return {
                title: "Generate",
                description: "Create professional product imagery with AI",
            };
        }

        if (path === "/history") {
            return {
                title: "History",
                description: "View and manage your generated images",
            };
        }

        if (path === "/admin") {
            return {
                title: "Admin Dashboard",
                description: "Manage your AI image generation platform",
            };
        }

        if (path === "/admin/providers") {
            return {
                title: "AI Providers",
                description: "Configure AI providers and API connections",
            };
        }

        if (path === "/admin/models") {
            return {
                title: "AI Models",
                description: "Manage the AI models available to users",
            };
        }

        if (path === "/admin/api-usage") {
            return {
                title: "API Usage",
                description: "Monitor AI provider requests and activity",
            };
        }

        if (path.startsWith("/generations/")) {
            return {
                title: "Generation Details",
                description: "View details and manage your generated image",
            };
        }

        return {
            title: "AI Product Studio",
            description: "AI-powered product image generation",
        };
    };

    const pageInfo = getPageInfo();

    return (
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur lg:px-8">
            {/* Page information */}
            <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                    {pageInfo.title}
                </h2>

                <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                    {pageInfo.description}
                </p>
            </div>

            {/* User actions */}
            <div className="ml-6 flex shrink-0 items-center gap-3">
                <div className="hidden items-center gap-3 border-r border-slate-200 pr-4 sm:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="max-w-40">
                        <p className="truncate text-sm font-semibold text-slate-800">
                            {user?.name || "User"}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                            {user?.email || ""}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Topbar;