"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import {
    Heart,
    Play,
    Trash2,
    Music2,
    Disc3,
    LogIn,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Song } from "@/types";

export default function MyPlaylistPage() {
    const { isAuthenticated, userId } = useAuthStore();
    const router = useRouter();
    const { playSong, playPlaylist, currentSong } = usePlayerStore();

    const savedSongs = useQuery(
        api.playlist.getUserSavedSongs,
        userId ? { userId: userId as Id<"users"> } : "skip"
    );

    const unsaveSong = useMutation(api.playlist.unsaveSong);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            // Don't redirect immediately, show a message
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="px-4 py-20 max-w-4xl mx-auto text-center animate-fade-in">
                <div className="glass-card p-12 max-w-md mx-auto">
                    <LogIn size={48} className="mx-auto mb-6 text-primary" />
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Sign in to View Your Playlist
                    </h2>
                    <p className="text-text-secondary text-sm mb-6">
                        Create an account or sign in to save and manage your favorite songs.
                    </p>
                    <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                        <LogIn size={18} />
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const handleRemove = async (songId: Id<"songs">) => {
        try {
            await unsaveSong({
                userId: userId as Id<"users">,
                songId,
            });
            toast.success("Removed from playlist");
        } catch {
            toast.error("Failed to remove song");
        }
    };

    const handlePlayAll = () => {
        if (savedSongs && savedSongs.length > 0) {
            const songs: Song[] = savedSongs.map((s: any) => ({
                _id: s._id,
                movieId: s.movieId,
                title: s.title,
                youtubeId: s.youtubeId,
                thumbnail: s.thumbnail,
                channelTitle: s.channelTitle,
            }));
            playPlaylist(songs, 0);
        }
    };

    const handlePlaySong = (song: any) => {
        const songObj: Song = {
            _id: song._id,
            movieId: song.movieId,
            title: song.title,
            youtubeId: song.youtubeId,
            thumbnail: song.thumbnail,
            channelTitle: song.channelTitle,
        };

        const allSongs: Song[] = (savedSongs || []).map((s: any) => ({
            _id: s._id,
            movieId: s.movieId,
            title: s.title,
            youtubeId: s.youtubeId,
            thumbnail: s.thumbnail,
            channelTitle: s.channelTitle,
        }));

        playSong(songObj, allSongs);
    };

    return (
        <div className="px-4 py-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow">
                        <Heart size={24} className="text-white fill-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Playlist</h1>
                        <p className="text-text-secondary text-sm mt-0.5">
                            {savedSongs?.length || 0} saved song
                            {savedSongs?.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {savedSongs && savedSongs.length > 0 && (
                    <button
                        onClick={handlePlayAll}
                        className="btn-primary flex items-center gap-2 py-2.5 px-5"
                    >
                        <Play size={18} className="fill-current" />
                        Play All
                    </button>
                )}
            </div>

            {/* Songs list */}
            {savedSongs === undefined ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="glass-card p-4 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg skeleton" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 skeleton" />
                                <div className="h-3 w-1/2 skeleton" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : savedSongs.length === 0 ? (
                <div className="text-center py-20 animate-fade-in">
                    <Disc3 size={64} className="mx-auto mb-6 text-text-muted/30" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No Songs Yet
                    </h3>
                    <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
                        Search for your favorite heroes and tap the ❤️ icon to save songs to
                        your playlist.
                    </p>
                    <Link
                        href="/"
                        className="btn-primary inline-flex items-center gap-2 px-6 py-3"
                    >
                        <Music2 size={18} />
                        Discover Music
                    </Link>
                </div>
            ) : (
                <div className="space-y-2 animate-fade-in">
                    {savedSongs.map((song, i) => {
                        const isCurrentlyPlaying =
                            currentSong?.youtubeId === song.youtubeId;

                        return (
                            <div
                                key={song._id}
                                className={`group glass-card p-4 flex items-center gap-4 animate-fade-in ${isCurrentlyPlaying ? "!border-primary/20 !bg-primary/5" : ""
                                    }`}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {/* Number */}
                                <span className="text-sm text-text-muted font-mono w-6 text-center flex-shrink-0">
                                    {i + 1}
                                </span>

                                {/* Thumbnail */}
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface cursor-pointer"
                                    onClick={() => handlePlaySong(song)}
                                >
                                    {song.thumbnail ? (
                                        <Image
                                            src={song.thumbnail}
                                            alt={song.title}
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-surface-light">
                                            <Music2 size={18} className="text-text-muted" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <Play size={20} className="text-white fill-white" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm font-medium line-clamp-1 ${isCurrentlyPlaying ? "text-primary-light" : "text-white"
                                            }`}
                                    >
                                        {song.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {song.movieTitle && (
                                            <span className="text-xs text-text-muted line-clamp-1">
                                                {song.movieTitle}
                                                {song.movieYear ? ` (${song.movieYear})` : ""}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePlaySong(song)}
                                        className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <Play size={16} className="fill-current" />
                                    </button>
                                    <button
                                        onClick={() => handleRemove(song._id)}
                                        className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
