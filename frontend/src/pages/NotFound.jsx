import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function NotFound() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50">
                    <span className="text-3xl font-bold text-indigo-600">
                        404
                    </span>
                </div>

                <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                    Page not found
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    The page you're looking for doesn't exist or
                    may have been moved.
                </p>

                <Link
                    to={
                        isAuthenticated
                            ? "/dashboard"
                            : "/login"
                    }
                    className="mt-7 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    {isAuthenticated
                        ? "Back to Dashboard"
                        : "Back to Login"}
                </Link>
            </div>
        </div>
    );
}

export default NotFound;