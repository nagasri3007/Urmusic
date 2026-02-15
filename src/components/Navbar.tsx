"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import toast from "react-hot-toast";
import {
    Music,
    Search,
    Heart,
    LogOut,
    LogIn,
    User,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, name, email, token, clearAuth } = useAuthStore();
    const logout = useMutation(api.auth.logout);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            if (token) await logout({ token });
            clearAuth();
            toast.success("Logged out successfully");
        } catch {
            clearAuth();
        }
    };

    const navLinks = [
        { href: "/", label: "Home", icon: Music },
        { href: "/search", label: "Search", icon: Search },
    ];

    if (isAuthenticated) {
        navLinks.push({ href: "/my-playlist", label: "My Playlist", icon: Heart });
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 player-backdrop">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                            <Music size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">UrMusic</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                        ? "bg-white/10 text-white"
                                        : "text-text-secondary hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon size={16} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                        <User size={14} />
                                    </div>
                                    <span className="text-sm text-text-secondary">
                                        {name || email}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 btn-primary text-sm py-2 px-5"
                            >
                                <LogIn size={16} />
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5"
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/5 animate-slide-down">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? "bg-white/10 text-white"
                                            : "text-text-secondary hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="border-t border-white/5 my-2" />
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                            <User size={14} />
                                        </div>
                                        <span className="text-sm text-text-secondary">
                                            {name || email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/5"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-primary"
                                >
                                    <LogIn size={18} />
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
