"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, User, Loader2 } from "lucide-react";
import Image from "next/image";

interface Suggestion {
    id: number;
    name: string;
    profile_path: string | null;
}

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
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!query.trim() || !isFocused) {
            setSuggestions([]);
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(async () => {
            setIsLoadingSuggestions(true);
            try {
                const res = await fetch(`/api/tmdb/suggest?q=${encodeURIComponent(query.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []);
                }
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 300);

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [query, isFocused]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleSuggestionClick = (hero: string) => {
        setQuery(hero);
        router.push(`/search?q=${encodeURIComponent(hero)}`);
        setIsFocused(false);
    };

    const handleApiSuggestionClick = (suggestion: Suggestion) => {
        setQuery(suggestion.name);
        router.push(`/search?q=${encodeURIComponent(suggestion.name)}&id=${suggestion.id}`);
        setIsFocused(false);
    };

    return (
        <div className="w-full max-w-2xl mx-auto relative z-50">
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

                {/* Autocomplete Dropdown */}
                {isFocused && query.trim() && (suggestions.length > 0 || isLoadingSuggestions) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
                        {isLoadingSuggestions ? (
                            <div className="p-4 flex items-center justify-center text-text-muted">
                                <Loader2 size={20} className="animate-spin" />
                            </div>
                        ) : (
                            <ul className="py-2">
                                {suggestions.map((suggestion) => (
                                    <li key={suggestion.id}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleApiSuggestionClick(suggestion);
                                            }}
                                            className="w-full px-4 py-2 hover:bg-white/5 flex items-center gap-3 transition-colors text-left"
                                        >
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-light flex-shrink-0 border border-white/5">
                                                {suggestion.profile_path ? (
                                                    <Image
                                                        src={suggestion.profile_path}
                                                        alt={suggestion.name}
                                                        fill
                                                        sizes="40px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User size={16} className="text-text-muted" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-white font-medium">{suggestion.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
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
