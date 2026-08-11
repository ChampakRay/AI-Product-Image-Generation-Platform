import { useState } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import api from "../../api/axios";

function ResetPassword() {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const navigate = useNavigate();

    const [form, setForm] = useState({
        password: "",
        password_confirmation: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

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
                password_confirmation: form.password_confirmation,
            });

            setMessage(
                response.data.message || "Password reset successfully."
            );

            setTimeout(() => {
                navigate("/login");
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
                        "Password reset failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6">
                <h1 className="text-3xl font-bold mb-6">
                    Reset Password
                </h1>

                {message && (
                    <div className="mb-4 rounded border border-green-300 p-3 text-green-600">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded border border-red-300 p-3 text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-1 font-medium"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded border p-2"
                            />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-1 font-medium"
                        >
                            New Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            className="w-full rounded border p-2"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password_confirmation"
                            className="block mb-1 font-medium"
                        >
                            Confirm New Password
                        </label>

                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            required
                            minLength={8}
                            className="w-full rounded border p-2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div className="mt-4 text-sm">
                    <Link to="/login" className="underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;