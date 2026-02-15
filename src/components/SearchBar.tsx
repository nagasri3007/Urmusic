"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

interface SearchBarProps {
    initialQuery?: string;
    size?: "lg" | "md";
    showSuggestions?: boolean;
}

const trendingHeroes = [
    "Mahesh Babu",
    "Hrithik Roshan",
    "Tom Cruise",
    "Allu Arjun",
    "Shah Rukh Khan",
    "Prabhas",
];

export default function SearchBar({
    initialQuery = "",
    size = "lg",
    showSuggestions = false,
}: SearchBarProps) {
    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleSuggestionClick = (hero: string) => {
        setQuery(hero);
        router.push(`/search?q=${encodeURIComponent(hero)}`);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
                <div
                    className={`relative flex items-center transition-all duration-500 ${isFocused ? "scale-[1.02]" : ""
                        }`}
                >
                    <div className="absolute left-4 text-text-muted group-focus-within:text-primary transition-colors duration-300">
                        <Search size={size === "lg" ? 22 : 18} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder="Search for a movie hero..."
                        className={`w-full glass-input ${size === "lg"
                                ? "py-4 pl-14 pr-32 text-lg"
                                : "py-3 pl-12 pr-28 text-base"
                            } font-medium`}
                        id="hero-search-input"
                    />
                    <button
                        type="submit"
                        className={`absolute right-2 btn-primary ${size === "lg" ? "py-2.5 px-6" : "py-2 px-4 text-sm"
                            } flex items-center gap-2`}
                    >
                        <Sparkles size={size === "lg" ? 16 : 14} />
                        Search
                    </button>
                </div>

                {/* Glow effect */}
                <div
                    className={`absolute inset-0 -z-10 rounded-xl transition-all duration-500 ${isFocused
                            ? "bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 blur-xl opacity-100"
                            : "opacity-0"
                        }`}
                />
            </form>

            {/* Quick suggestions */}
            {showSuggestions && (
                <div className="mt-6 flex flex-wrap items-center gap-2 justify-center">
                    <span className="text-xs text-text-muted mr-1">Try:</span>
                    {trendingHeroes.map((hero) => (
                        <button
                            key={hero}
                            onClick={() => handleSuggestionClick(hero)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all duration-300"
                        >
                            {hero}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
