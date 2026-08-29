import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function Icon({ type }) {
    const common = {
        width: 18,
        height: 18,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    if (type === "dashboard") {
        return (
            <svg {...common}>
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
        );
    }

    if (type === "generate") {
        return (
            <svg {...common}>
                <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
                <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
            </svg>
        );
    }

    if (type === "history") {
        return (
            <svg {...common}>
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
                <path d="M12 7v5l3 2" />
            </svg>
        );
    }

    if (type === "admin") {
        return (
            <svg {...common}>
                <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        );
    }

    if (type === "providers") {
        return (
            <svg {...common}>
                <rect x="4" y="3" width="16" height="7" rx="1.5" />
                <rect x="4" y="14" width="16" height="7" rx="1.5" />
                <path d="M8 6.5h.01" />
                <path d="M8 17.5h.01" />
                <path d="M11 6.5h5" />
                <path d="M11 17.5h5" />
            </svg>
        );
    }

    if (type === "models") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.4 1.4-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L9 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H7.6v-2h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L9 9l1.4-1.4.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h2v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L20 9l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2h-.2a1.7 1.7 0 0 0-1.8 1Z" />
            </svg>
        );
    }

    if (type === "api") {
        return (
            <svg {...common}>
                <path d="M4 19V9" />
                <path d="M10 19V5" />
                <path d="M16 19v-7" />
                <path d="M22 19V3" />
            </svg>
        );
    }

    if (type === "users") {
    return (
        <svg {...common}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            );
         }

    if (type === "chevron") {
        return (
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m9 18 6-6-6-6" />
            </svg>
        );
    }

    return null;
}

function SidebarLink({ item }) {
    return (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                        ? "bg-indigo-500/20 text-white shadow-sm"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            isActive
                                ? "bg-indigo-500/20 text-indigo-300"
                                : "text-slate-400 group-hover:text-slate-200"
                        }`}
                    >
                        <Icon type={item.icon} />
                    </span>

                    <span>{item.name}</span>
                </>
            )}
        </NavLink>
    );
}

function Sidebar() {
    const { user } = useAuth();

    const workspaceNavigation = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: "dashboard",
        },
        {
            name: "Generate",
            path: "/generate",
            icon: "generate",
        },
        {
            name: "History",
            path: "/history",
            icon: "history",
        },
    ];

    const adminNavigation = [
        {
            name: "Admin Dashboard",
            path: "/admin",
            icon: "admin",
        },

        {
            name: "Analytics",
            path: "/admin/analytics",
            icon: "dashboard",
        },

        {
        name: "Users",
        path: "/admin/users",
        icon: "users",
        },

        {
        name: "Generations",
        path: "/admin/generations",
        icon: "history",
        },

        {
            name: "AI Providers",
            path: "/admin/providers",
            icon: "providers",
        },
        {
            name: "AI Models",
            path: "/admin/models",
            icon: "models",
        },
        {
            name: "API Usage",
            path: "/admin/api-usage",
            icon: "api",
        },
    ];

    const isAdmin = user?.role === "admin";

    const displayName =
        user?.name ||
        user?.email ||
        "User";

    const initial =
        displayName.charAt(0).toUpperCase();

    return (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
            {/* Brand */}
            <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/40">
                        <span className="text-lg">
                            ✦
                        </span>
                    </div>

                    <div>
                        <h1 className="text-sm font-bold tracking-tight text-white">
                            AI Product Studio
                        </h1>

                        <p className="mt-0.5 text-xs text-slate-400">
                            AI image generation
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-6">
                {/* Workspace */}
                <div>
                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Workspace
                    </p>

                    <div className="space-y-1">
                        {workspaceNavigation.map(
                            (item) => (
                                <SidebarLink
                                    key={item.path}
                                    item={item}
                                />
                            )
                        )}
                    </div>
                </div>

                {/* Administration */}
                {isAdmin && (
                    <div className="mt-8">
                        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Administration
                        </p>

                        <div className="space-y-1">
                            {adminNavigation.map(
                                (item) => (
                                    <SidebarLink
                                        key={item.path}
                                        item={item}
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Profile / Settings */}
            <div className="shrink-0 border-t border-white/10 p-3">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                            isActive
                                ? "bg-indigo-500/20"
                                : "bg-white/5 hover:bg-white/10"
                        }`
                    }
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
                        {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                            {displayName}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {isAdmin
                                ? "Administrator"
                                : "User"}
                        </p>
                    </div>

                    <span className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300">
                        <Icon type="chevron" />
                    </span>
                </NavLink>
            </div>
        </aside>
    );
}

export default Sidebar;