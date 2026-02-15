import AuthForm from "@/components/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up - UrMusic",
    description: "Create a UrMusic account to save your favorite movie songs",
};

export default function SignupPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
            {/* Background effects */}
            <div className="floating-orb w-80 h-80 bg-accent top-10 -right-40" />
            <div className="floating-orb w-64 h-64 bg-primary bottom-20 -left-32" />
            <AuthForm mode="signup" />
        </div>
    );
}
