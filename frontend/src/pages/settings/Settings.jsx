import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";

function UserIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect
                x="4"
                y="10"
                width="16"
                height="11"
                rx="2"
            />

            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}

function Settings() {
    const { user, setUser } = useAuth();

    const [profile, setProfile] = useState({
        name: "",
        email: "",
    });

    const [profileLoading, setProfileLoading] =
        useState(true);

    const [profileSaving, setProfileSaving] =
        useState(false);

    const [profileError, setProfileError] =
        useState("");

    const [profileSuccess, setProfileSuccess] =
        useState("");

    const [passwordForm, setPasswordForm] =
        useState({
            current_password: "",
            password: "",
            password_confirmation: "",
        });

    const [passwordSaving, setPasswordSaving] =
        useState(false);

    const [passwordError, setPasswordError] =
        useState("");

    const [passwordSuccess, setPasswordSuccess] =
        useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true);
                setProfileError("");

                const response =
                    await api.get("/profile");

                const profileUser =
                    response.data?.user;

                if (profileUser) {
                    setProfile({
                        name:
                            profileUser.name || "",
                        email:
                            profileUser.email || "",
                    });

                    setUser(profileUser);
                }
            } catch (error) {
                setProfileError(
                    error.response?.data
                        ?.message ||
                        "Unable to load your profile."
                );
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();
    }, [setUser]);

    const handleProfileChange = (
        event
    ) => {
        const { name, value } =
            event.target;

        setProfile((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handlePasswordChange = (
        event
    ) => {
        const { name, value } =
            event.target;

        setPasswordForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const getFirstValidationError = (
        errors
    ) => {
        if (!errors) {
            return "";
        }

        const firstError =
            Object.values(errors)
                .flat()[0];

        return firstError || "";
    };

    const handleProfileSubmit = async (
        event
    ) => {
        event.preventDefault();

        setProfileError("");
        setProfileSuccess("");

        try {
            setProfileSaving(true);

            const response =
                await api.put(
                    "/profile",
                    profile
                );

            const updatedUser =
                response.data?.user;

            if (updatedUser) {
                setUser(updatedUser);

                setProfile({
                    name:
                        updatedUser.name ||
                        "",
                    email:
                        updatedUser.email ||
                        "",
                });
            }

            setProfileSuccess(
                response.data?.message ||
                    "Profile updated successfully."
            );
        } catch (error) {
            const validationError =
                getFirstValidationError(
                    error.response?.data
                        ?.errors
                );

            setProfileError(
                validationError ||
                    error.response?.data
                        ?.message ||
                    "Unable to update your profile."
            );
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (
        event
    ) => {
        event.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        if (
            passwordForm.password !==
            passwordForm.password_confirmation
        ) {
            setPasswordError(
                "The new passwords do not match."
            );
            return;
        }

        try {
            setPasswordSaving(true);

            const response =
                await api.put(
                    "/profile/password",
                    passwordForm
                );

            /*
             * The backend invalidates the old
             * Sanctum tokens and returns a new one.
             */
            if (response.data?.token) {
                localStorage.setItem(
                    "auth_token",
                    response.data.token
                );
            }

            setPasswordForm({
                current_password: "",
                password: "",
                password_confirmation: "",
            });

            setPasswordSuccess(
                response.data?.message ||
                    "Password updated successfully."
            );
        } catch (error) {
            const validationError =
                getFirstValidationError(
                    error.response?.data
                        ?.errors
                );

            setPasswordError(
                validationError ||
                    error.response?.data
                        ?.message ||
                    "Unable to update your password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    const displayName =
        profile.name ||
        user?.name ||
        user?.email ||
        "User";

    const initial =
        displayName
            .charAt(0)
            .toUpperCase();

    const isAdmin =
        user?.role === "admin";

    if (profileLoading) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading your profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Page Header */}
            <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Account
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    Profile & Settings
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Manage your profile information
                    and account security.
                </p>
            </div>

            {/* Profile Card */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <UserIcon />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-950">
                                Profile
                            </h2>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Update your account
                                information.
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={
                        handleProfileSubmit
                    }
                    className="p-6"
                >
                    {/* Profile Identity */}
                    <div className="mb-7 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-600">
                            {initial}
                        </div>

                        <div>
                            <p className="font-semibold text-slate-900">
                                {displayName}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {isAdmin
                                    ? "Administrator account"
                                    : "User account"}
                            </p>
                        </div>
                    </div>

                    {profileError && (
                        <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertIcon />

                            <span>
                                {
                                    profileError
                                }
                            </span>
                        </div>
                    )}

                    {profileSuccess && (
                        <div className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            <CheckIcon />

                            <span>
                                {
                                    profileSuccess
                                }
                            </span>
                        </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="profile-name"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Full Name
                            </label>

                            <input
                                id="profile-name"
                                name="name"
                                type="text"
                                value={
                                    profile.name
                                }
                                onChange={
                                    handleProfileChange
                                }
                                required
                                maxLength={
                                    255
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="profile-email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Email Address
                            </label>

                            <input
                                id="profile-email"
                                name="email"
                                type="email"
                                value={
                                    profile.email
                                }
                                onChange={
                                    handleProfileChange
                                }
                                required
                                maxLength={
                                    255
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    {/* Verification */}
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-emerald-600">
                                <CheckIcon />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-800">
                                    Email verification
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {user?.email_verified_at
                                        ? "Your email address is verified."
                                        : "Your email address is not verified."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                profileSaving
                            }
                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {profileSaving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Security Card */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <LockIcon />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-950">
                                Security
                            </h2>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Change your account
                                password.
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={
                        handlePasswordSubmit
                    }
                    className="p-6"
                >
                    {passwordError && (
                        <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertIcon />

                            <span>
                                {
                                    passwordError
                                }
                            </span>
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            <CheckIcon />

                            <span>
                                {
                                    passwordSuccess
                                }
                            </span>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label
                                htmlFor="current-password"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Current Password
                            </label>

                            <input
                                id="current-password"
                                name="current_password"
                                type="password"
                                value={
                                    passwordForm.current_password
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                required
                                autoComplete="current-password"
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                placeholder="Enter your current password"
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="new-password"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    New Password
                                </label>

                                <input
                                    id="new-password"
                                    name="password"
                                    type="password"
                                    value={
                                        passwordForm.password
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    required
                                    minLength={
                                        8
                                    }
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Confirm New Password
                                </label>

                                <input
                                    id="confirm-password"
                                    name="password_confirmation"
                                    type="password"
                                    value={
                                        passwordForm.password_confirmation
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    required
                                    minLength={
                                        8
                                    }
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                    placeholder="Confirm your new password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs leading-5 text-slate-500">
                            Changing your password
                            will sign out other
                            active sessions for
                            security.
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                passwordSaving
                            }
                            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {passwordSaving
                                ? "Updating..."
                                : "Update Password"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default Settings;