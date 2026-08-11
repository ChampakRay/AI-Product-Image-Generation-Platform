import { useAuth } from "../../context/useAuth";

function Topbar() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div>
                <h2 className="text-lg font-semibold">
                    Dashboard
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                    {user?.name || user?.email}
                </span>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Topbar;