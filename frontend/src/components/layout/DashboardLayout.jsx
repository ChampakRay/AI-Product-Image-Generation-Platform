import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Fixed sidebar */}
            <div className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
                <Sidebar />
            </div>

            {/* Main application */}
            <div className="min-h-screen lg:pl-64">
                <Topbar />

                <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;