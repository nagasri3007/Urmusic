"use client";

export function MovieCardSkeleton() {
    return (
        <div className="glass-card p-4">
            <div className="flex items-center gap-4">
                <div className="w-20 h-28 rounded-lg skeleton flex-shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 skeleton" />
                    <div className="h-4 w-1/3 skeleton" />
                    <div className="h-3 w-full skeleton hidden sm:block" />
                    <div className="h-3 w-2/3 skeleton hidden sm:block" />
                </div>
                <div className="w-10 h-10 rounded-xl skeleton" />
            </div>
        </div>
    );
}

export function SongCardSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl">
            <div className="w-12 h-12 rounded-lg skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-3 w-1/2 skeleton" />
            </div>
        </div>
    );
}

export function HeroCardSkeleton() {
    return (
        <div className="glass-card p-6 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full skeleton" />
            <div className="h-4 w-24 skeleton" />
        </div>
    );
}

export function SearchPageSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Actor section */}
            <div className="glass-card p-6 flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl skeleton flex-shrink-0" />
                <div className="space-y-3">
                    <div className="h-6 w-48 skeleton" />
                    <div className="h-4 w-32 skeleton" />
                    <div className="h-3 w-24 skeleton" />
                </div>
            </div>

            {/* Movie skeletons */}
            {[1, 2, 3, 4].map((i) => (
                <MovieCardSkeleton key={i} />
            ))}
        </div>
    );
}
