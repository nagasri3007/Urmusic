import AuthForm from "@/components/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In - UrMusic",
    description: "Sign in to your UrMusic account to access your saved playlists",
};

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
            {/* Background effects */}
            <div className="floating-orb w-72 h-72 bg-primary top-20 -left-36" />
            <div className="floating-orb w-60 h-60 bg-accent bottom-20 -right-30" />
            <AuthForm mode="login" />
        </div>
    );
}
