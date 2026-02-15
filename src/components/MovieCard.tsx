"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Film, Calendar, Loader2 } from "lucide-react";
import SongCard from "./SongCard";
import { Song } from "@/types";

interface MovieCardProps {
    title: string;
    year?: number;
    posterUrl?: string;
    overview?: string;
    songs: Song[];
    index: number;
    songsLoading?: boolean;
    songsLoaded?: boolean;
    onExpand?: () => void;
}

export default function MovieCard({
    title,
    year,
    posterUrl,
    overview,
    songs,
    index,
    songsLoading = false,
    songsLoaded = false,
    onExpand,
}: MovieCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        const willExpand = !isExpanded;
        setIsExpanded(willExpand);

        // Lazy load songs when expanding for the first time
        if (willExpand && !songsLoaded && !songsLoading && onExpand) {
            onExpand();
        }
    };

    return (
        <div
            className="glass-card overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div
                className="flex items-center gap-4 p-4 cursor-pointer select-none"
                onClick={handleToggle}
            >
                {/* Poster */}
                <div className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                    {posterUrl ? (
                        <Image
                            src={posterUrl}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-light">
                            <Film size={24} className="text-text-muted" />
                        </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold line-clamp-1 text-base sm:text-lg">
                        {title}
                    </h3>
                    {year && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <Calendar size={13} className="text-text-muted" />
                            <span className="text-sm text-text-secondary">{year}</span>
                        </div>
                    )}
                    {overview && (
                        <p className="text-xs text-text-muted mt-1.5 line-clamp-2 hidden sm:block">
                            {overview}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        {songsLoaded ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light font-medium">
                                {songs.length} song{songs.length !== 1 ? "s" : ""}
                            </span>
                        ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted font-medium">
                                Tap to load songs
                            </span>
                        )}
                    </div>
                </div>

                {/* Expand button */}
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-text-secondary hover:text-white">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Songs list */}
            {isExpanded && (
                <div className="border-t border-white/5 px-4 pb-4 animate-slide-down">
                    <div className="pt-3 space-y-2">
                        {/* Loading state */}
                        {songsLoading && (
                            <div className="flex items-center justify-center gap-3 py-8">
                                <Loader2 size={20} className="text-primary animate-spin" />
                                <span className="text-sm text-text-secondary">
                                    Loading songs...
                                </span>
                            </div>
                        )}

                        {/* Songs loaded */}
                        {songsLoaded && songs.length > 0 && (
                            songs.map((song, i) => (
                                <SongCard
                                    key={song._id || song.youtubeId}
                                    song={song}
                                    allSongs={songs}
                                    index={i}
                                />
                            ))
                        )}

                        {/* No songs found */}
                        {songsLoaded && songs.length === 0 && (
                            <p className="text-center text-text-muted py-6 text-sm">
                                No songs found yet. Try again later!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
