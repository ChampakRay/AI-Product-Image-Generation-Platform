function Sidebar() {
    return (
        <aside className="w-64 shrink-0 border-r bg-white">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold">
                    AI Product Studio
                </h1>
            </div>

            <nav className="p-4">
                <a
                    href="/dashboard"
                    className="block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                >
                    Dashboard
                </a>
            </nav>
        </aside>
    );
}

export default Sidebar;