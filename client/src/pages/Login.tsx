import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MailIcon, LockIcon, ArrowRightIcon, User2Icon, KeyRoundIcon, ArrowLeftIcon, CheckCircle2Icon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

type AuthMode = "login" | "signup" | "forgot" | "reset";

export default function Login() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (searchParams.get("expired") === "true") {
            toast.error("Your session expired after 1 day of inactivity. Please log in again.", {
                id: "expired-session",
                duration: 5000,
            });
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    // Handle Login and Sign Up
    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post(`/api/auth/${mode === "login" ? "login" : "register"}`, { name, email, password });
            toast.success(mode === "login" ? "Welcome back!" : "Account created successfully!");
            login(data, data.token);
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    // Handle Forgot Password - Request Reset OTP
    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post("/api/auth/forgot-password", { email });
            toast.success("Verification code generated!");
            if (data.otp) {
                setReceivedOtp(data.otp);
                setOtp(data.otp);
            }
            setMode("reset");
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message || "Failed to generate reset code");
        } finally {
            setLoading(false);
        }
    };

    // Handle Reset Password - Submit OTP and New Password
    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post("/api/auth/reset-password", {
                email,
                otp,
                newPassword: password,
            });
            toast.success(data.message || "Password reset successfully!");
            setPassword("");
            setConfirmPassword("");
            setOtp("");
            setReceivedOtp(null);
            setMode("login");
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
                    <div className="flex flex-col items-center mb-8">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.svg" alt="Logo" className="size-6.5" />
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800">AIgnite</h1>
                        </Link>
                        <p className="text-slate-500 text-sm mt-1">
                            {mode === "login" && "Sign in to your Dashboard"}
                            {mode === "signup" && "Create your scheduler account"}
                            {mode === "forgot" && "Recover your password"}
                            {mode === "reset" && "Create a new password"}
                        </p>
                    </div>

                    {/* VIEW 1: Login or Sign Up */}
                    {(mode === "login" || mode === "signup") && (
                        <form onSubmit={handleAuthSubmit} className="space-y-4 text-sm">
                            {mode === "signup" && (
                                <div>
                                    <label className="block mb-1.5 font-medium text-slate-700">Name</label>
                                    <div className="relative">
                                        <User2Icon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your name"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block mb-1.5 font-medium text-slate-700">Email</label>
                                <div className="relative">
                                    <MailIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@company.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="font-medium text-slate-700">Password</label>
                                    {mode === "login" && (
                                        <button
                                            type="button"
                                            onClick={() => setMode("forgot")}
                                            className="text-xs text-red-600 hover:text-red-700 transition"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <LockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                {loading ? (
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {mode === "login" ? "Sign In" : "Sign Up"} <ArrowRightIcon className="size-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* VIEW 2: Forgot Password Request */}
                    {mode === "forgot" && (
                        <form onSubmit={handleForgotSubmit} className="space-y-4 text-sm">
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                                Enter the email associated with your AIgnite account. We will generate a secure 6-digit verification code to reset your password.
                            </div>

                            <div>
                                <label className="block mb-1.5 font-medium text-slate-700">Email Address</label>
                                <div className="relative">
                                    <MailIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@company.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                {loading ? (
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Send Verification Code <ArrowRightIcon className="size-4" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 pt-2"
                            >
                                <ArrowLeftIcon className="size-3.5" /> Back to Sign In
                            </button>
                        </form>
                    )}

                    {/* VIEW 3: Enter OTP & Set New Password */}
                    {mode === "reset" && (
                        <form onSubmit={handleResetSubmit} className="space-y-4 text-sm">
                            {receivedOtp && (
                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                                    <CheckCircle2Icon className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Reset code generated:</p>
                                        <p className="font-mono text-sm tracking-wider font-bold text-emerald-950 mt-0.5">{receivedOtp}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block mb-1.5 font-medium text-slate-700">6-Digit Verification Code</label>
                                <div className="relative">
                                    <KeyRoundIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        placeholder="123456"
                                        className="w-full pl-10 pr-4 py-2.5 font-mono text-base tracking-widest bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1.5 font-medium text-slate-700">New Password</label>
                                <div className="relative">
                                    <LockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        placeholder="At least 6 characters"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1.5 font-medium text-slate-700">Confirm New Password</label>
                                <div className="relative">
                                    <LockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="Re-enter new password"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 outline-slate-300 border border-slate-200 rounded-xl"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                {loading ? (
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Reset Password <ArrowRightIcon className="size-4" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 pt-2"
                            >
                                <ArrowLeftIcon className="size-3.5" /> Back to Sign In
                            </button>
                        </form>
                    )}

                    {/* Mode switcher footer */}
                    {(mode === "login" || mode === "signup") && (
                        <div className="mt-6 text-center text-sm text-slate-500">
                            {mode === "login" ? (
                                <>
                                    Don't have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setMode("signup")}
                                        className="text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Create one free
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setMode("login")}
                                        className="text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Sign In
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
