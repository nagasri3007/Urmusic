"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/store/authStore";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";

interface AuthFormProps {
    mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const login = useMutation(api.auth.login);
    const signup = useMutation(api.auth.signup);
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (mode === "signup") {
                const result = await signup({ email, password, name: name || undefined });
                setAuth({
                    token: result.token,
                    userId: result.userId as Id<"users">,
                    email,
                    name: name || undefined,
                });
                toast.success("Account created successfully! 🎉");
            } else {
                const result = await login({ email, password });
                setAuth({
                    token: result.token,
                    userId: result.userId as Id<"users">,
                    email: result.email,
                    name: result.name || undefined,
                });
                toast.success("Welcome back! 🎵");
            }
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="glass-card p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        {mode === "login" ? "Welcome Back" : "Join UrMusic"}
                    </h1>
                    <p className="text-text-secondary text-sm">
                        {mode === "login"
                            ? "Sign in to access your playlists"
                            : "Create an account to save your favorite songs"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                            />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full glass-input py-3 pl-12 pr-4"
                                id="auth-name"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                            className="w-full glass-input py-3 pl-12 pr-4"
                            id="auth-email"
                        />
                    </div>

                    <div className="relative">
                        <Lock
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            minLength={6}
                            className="w-full glass-input py-3 pl-12 pr-12"
                            id="auth-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-3 text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : null}
                        {mode === "login" ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-text-secondary">
                        {mode === "login" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/signup"
                                    className="text-primary-light hover:text-primary transition-colors font-medium"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-primary-light hover:text-primary transition-colors font-medium"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
