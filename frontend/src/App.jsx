import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/dashboard/Dashboard";
import Generate from "./pages/dashboard/Generate";
import History from "./pages/dashboard/History";
import GenerationDetails from "./pages/dashboard/GenerationDetails";

import DashboardLayout from "./components/layout/DashboardLayout";

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

            {/* Protected application */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/generate"
                        element={<Generate />}
                    />

                    <Route
                        path="/history"
                        element={<History />}
                    />
                    </Route>
                    <Route
                        path="/generations/:generationId"
                        element={<GenerationDetails />}
                    />
                    </Route>

            {/* Fallback */}
            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />
        </Routes>
    );
}

export default App;