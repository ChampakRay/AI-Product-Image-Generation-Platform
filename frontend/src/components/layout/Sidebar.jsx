import { NavLink } from "react-router-dom";

function Sidebar() {
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
            </nav>
        </aside>
    );
}

export default Sidebar;