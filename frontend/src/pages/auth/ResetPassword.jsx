import { useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams,
    useParams,
} from "react-router-dom";
import api from "../../api/axios";

function ResetPassword() {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(
        searchParams.get("email") || ""
    );
    const navigate = useNavigate();

    const [form, setForm] = useState({
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (form.password.length < 8) {
            setError(
                "Password must be at least 8 characters long."
            );
            return;
        }

        if (form.password !== form.password_confirmation) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/reset-password", {
                email,
                token,
                password: form.password,
                password_confirmation:
                    form.password_confirmation,
            });

            setMessage(
                response.data.message ||
                    "Password reset successfully."
            );

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);
        } catch (error) {
            const errors = error.response?.data?.errors;

            if (errors) {
                const firstError = Object.values(errors)[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : "Password reset failed."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        "Password reset failed. The link may have expired."
                );
            }
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
                            Set a new password
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Choose a new password for your account.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        {message && (
                            <div
                                role="status"
                                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                            >
                                {message}
                                <div className="mt-1 text-xs text-emerald-600">
                                    Redirecting you to sign in...
                                </div>
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
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    New password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        placeholder="At least 8 characters"
                                        required
                                        minLength={8}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Use at least 8 characters.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Confirm new password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={
                                            showConfirmation
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            form.password_confirmation
                                        }
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        placeholder="Enter your password again"
                                        required
                                        minLength={8}
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmation(
                                                (current) => !current
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        {showConfirmation
                                            ? "Hide"
                                            : "Show"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || Boolean(message)}
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Updating password..."
                                    : "Update password"}
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

export default ResetPassword;