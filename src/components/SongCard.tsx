"use client";

import Image from "next/image";
import { Play, Heart, Music2 } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Song } from "@/types";
import toast from "react-hot-toast";
import { Id } from "@convex/_generated/dataModel";

interface SongCardProps {
    song: Song;
    allSongs?: Song[];
    index?: number;
    showRemove?: boolean;
    onRemove?: () => void;
}

export default function SongCard({
    song,
    allSongs,
    index = 0,
    showRemove = false,
    onRemove,
}: SongCardProps) {
    const { playSong, currentSong } = usePlayerStore();
    const { isAuthenticated, userId } = useAuthStore();
    const saveSong = useMutation(api.playlist.saveSong);
    const unsaveSong = useMutation(api.playlist.unsaveSong);

    const savedSongIds = useQuery(
        api.playlist.getUserSavedSongIds,
        userId ? { userId: userId as Id<"users"> } : "skip"
    );

    const isSaved = savedSongIds?.includes(song._id) ?? false;
    const isCurrentlyPlaying = currentSong?.youtubeId === song.youtubeId;

    const handlePlay = () => {
        playSong(song, allSongs);
    };

    const handleSave = async () => {
        if (!isAuthenticated || !userId) {
            toast.error("Please sign in to save songs");
            return;
        }

        try {
            if (isSaved) {
                await unsaveSong({
                    userId: userId as Id<"users">,
                    songId: song._id,
                });
                toast.success("Removed from playlist");
                if (showRemove && onRemove) onRemove();
            } else {
                await saveSong({
                    userId: userId as Id<"users">,
                    songId: song._id,
                });
                toast.success("Added to playlist ❤️");
            }
        } catch (error: any) {
            toast.error("Failed to update playlist");
        }
    };

    return (
        <div
            className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isCurrentlyPlaying
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-white/5"
                }`}
        >
            {/* Thumbnail */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                {song.thumbnail ? (
                    <Image
                        src={song.thumbnail}
                        alt={song.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-light">
                        <Music2 size={16} className="text-text-muted" />
                    </div>
                )}

                {/* Play overlay */}
                <button
                    onClick={handlePlay}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
                >
                    <Play size={18} className="text-white fill-white" />
                </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm font-medium line-clamp-1 ${isCurrentlyPlaying ? "text-primary-light" : "text-white"
                        }`}
                >
                    {song.title}
                </p>
                {song.channelTitle && (
                    <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                        {song.channelTitle}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={handlePlay}
                    className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-all"
                    title="Play"
                >
                    <Play size={16} className="fill-current" />
                </button>
                <button
                    onClick={handleSave}
                    className={`p-2 rounded-lg transition-all ${isSaved
                        ? "text-primary hover:bg-primary/10"
                        : "text-text-secondary hover:text-primary hover:bg-white/10"
                        }`}
                    title={isSaved ? "Remove from playlist" : "Save to playlist"}
                >
                    <Heart size={16} className={isSaved ? "fill-current" : ""} />
                </button>
            </div>

            {/* Always visible on mobile */}
            <div className="flex items-center gap-1 md:hidden">
                <button
                    onClick={handlePlay}
                    className="p-2 rounded-lg text-text-secondary"
                >
                    <Play size={16} className="fill-current" />
                </button>
                <button
                    onClick={handleSave}
                    className={`p-2 rounded-lg ${isSaved ? "text-primary" : "text-text-secondary"
                        }`}
                >
                    <Heart size={16} className={isSaved ? "fill-current" : ""} />
                </button>
            </div>
        </div>
    );
}
