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
                response.data.message || "Password reset link sent."
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
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6">
                <h1 className="text-3xl font-bold mb-6">
                    Forgot Password
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"}
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

export default ForgotPassword;