import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/forgot-password", {
                email,
            });

            setMessage(
                response.data.message ||
                    "Password reset link sent."
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to send password reset link."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
                                AI
                            </span>

                            <span className="text-xl font-bold tracking-tight text-slate-900">
                                Product Studio
                            </span>
                        </Link>

                        <h1 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">
                            Forgot your password?
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Enter your email address and we'll send you
                            a link to reset your password.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        {message && (
                            <div
                                role="status"
                                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                            >
                                {message}
                            </div>
                        )}

                        {error && (
                            <div
                                role="alert"
                                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setError("");
                                    }}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Sending reset link..."
                                    : "Send reset link"}
                            </button>
                        </form>

                        <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm">
                            <Link
                                to="/login"
                                className="font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                ← Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;