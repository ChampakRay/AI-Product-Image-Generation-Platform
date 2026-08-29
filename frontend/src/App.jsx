import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/dashboard/Dashboard";
import Generate from "./pages/dashboard/Generate";
import History from "./pages/dashboard/History";
import GenerationDetails from "./pages/dashboard/GenerationDetails";
import Settings from "./pages/settings/Settings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminModels from "./pages/admin/AdminModels";
import AdminApiUsage from "./pages/admin/AdminApiUsage";

import DashboardLayout from "./components/layout/DashboardLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGenerations from "./pages/admin/AdminGenerations";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
            />

            {/* Normal authenticated application */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                    path="/settings"
                    element={<Settings />}
                    />

                    <Route
                        path="/generate"
                        element={<Generate />}
                    />

                    <Route
                        path="/history"
                        element={<History />}
                    />

                    <Route
                        path="/generations/:generationId"
                        element={<GenerationDetails />}
                    />
                </Route>
            </Route>

            {/* Admin-only application */}
            <Route element={<ProtectedRoute adminOnly />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/admin"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/analytics"
                        element={<AdminAnalytics />}
                    />

                    <Route
                    path="/admin/generations"
                    element={<AdminGenerations />}
                    />

                    <Route
                        path="/admin/providers"
                        element={<AdminProviders />}
                    />

                    <Route
                        path="/admin/models"
                        element={<AdminModels />}
                    />

                    <Route
                    path="/admin/users"
                    element={<AdminUsers />}
                    />

                    <Route
                        path="/admin/api-usage"
                        element={<AdminApiUsage />}
                    />
                </Route>
            </Route>

            {/* Fallback */}
                <Route
                    path="*"
                    element={<NotFound />}
                />
        </Routes>
    );
}

export default App;