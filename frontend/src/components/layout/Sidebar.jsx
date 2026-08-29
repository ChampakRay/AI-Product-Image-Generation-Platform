import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function Sidebar() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const navigation = [
        {
            name: "Dashboard",
            path: "/dashboard",
        },
        {
            name: "Generate",
            path: "/generate",
        },
        {
            name: "History",
            path: "/history",
        },
    ];

    return (
        <aside className="w-64 shrink-0 border-r bg-white">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold">
                    AI Product Studio
                </h1>
            </div>

            <nav className="space-y-2 p-4">
                {navigation.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `block rounded-lg px-4 py-2 text-sm font-medium transition ${
                                isActive
                                    ? "bg-black text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}

                {/* Administration - Admin users only */}
                {isAdmin && (
                    <div className="mt-8">
                        <p className="mb-3 px-4 text-xs font-semibold tracking-wide text-gray-400">
                            ADMINISTRATION
                        </p>

                        <div className="space-y-2">
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `block rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-black text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                Admin Dashboard
                            </NavLink>

                            <NavLink
                                to="/admin/providers"
                                className={({ isActive }) =>
                                    `block rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-black text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                AI Providers
                            </NavLink>

                            <NavLink
                                to="/admin/models"
                                className={({ isActive }) =>
                                    `block rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-black text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                AI Models
                            </NavLink>

                            <NavLink
                                to="/admin/api-usage"
                                className={({ isActive }) =>
                                    `block rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-black text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`
                                }
                            >
                                API Usage
                            </NavLink>
                        </div>
                    </div>
                )}
            </nav>
        </aside>
    );
}

export default Sidebar;