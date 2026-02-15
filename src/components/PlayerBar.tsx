"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    X,
    Music2,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

// Declare the YouTube IFrame API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

let ytApiLoaded = false;
let ytApiReady = false;

function loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve) => {
        if (ytApiReady) {
            resolve();
            return;
        }
        if (ytApiLoaded) {
            // API script already loaded, wait for ready
            const check = setInterval(() => {
                if (ytApiReady) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
            return;
        }
        ytApiLoaded = true;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            ytApiReady = true;
            resolve();
        };
    });
}

export default function PlayerBar() {
    const {
        currentSong,
        isPlaying,
        isPlayerVisible,
        currentIndex,
        playlist,
        togglePlay,
        nextSong,
        prevSong,
        closePlayer,
        setIsPlaying,
    } = usePlayerStore();

    const [isExpanded, setIsExpanded] = useState(false);
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const expandedPlayerRef = useRef<any>(null);
    const expandedContainerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const progressInterval = useRef<any>(null);
    const currentVideoId = useRef<string | null>(null);

    // Initialize YouTube player
    const initPlayer = useCallback(async () => {
        if (!currentSong) return;

        await loadYouTubeAPI();

        // Destroy existing player if video changed
        if (playerRef.current && currentVideoId.current !== currentSong.youtubeId) {
            try {
                playerRef.current.destroy();
            } catch { }
            playerRef.current = null;
        }

        if (!playerRef.current && playerContainerRef.current) {
            // Clear container
            playerContainerRef.current.innerHTML = "";
            const div = document.createElement("div");
            div.id = "yt-player-" + Date.now();
            playerContainerRef.current.appendChild(div);

            playerRef.current = new window.YT.Player(div.id, {
                height: "1",
                width: "1",
                videoId: currentSong.youtubeId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                },
                events: {
                    onReady: (event: any) => {
                        event.target.playVideo();
                        setIsPlaying(true);
                        setDuration(event.target.getDuration() || 0);
                    },
                    onStateChange: (event: any) => {
                        // 0 = ended, 1 = playing, 2 = paused
                        if (event.data === 0) {
                            nextSong();
                        } else if (event.data === 1) {
                            setIsPlaying(true);
                            setDuration(event.target.getDuration() || 0);
                        } else if (event.data === 2) {
                            setIsPlaying(false);
                        }
                    },
                    onError: () => {
                        // Skip to next song on error
                        nextSong();
                    },
                },
            });
            currentVideoId.current = currentSong.youtubeId;
        } else if (playerRef.current && currentVideoId.current !== currentSong.youtubeId) {
            // Load new video
            try {
                playerRef.current.loadVideoById(currentSong.youtubeId);
                currentVideoId.current = currentSong.youtubeId;
            } catch {
                // Re-create player
                playerRef.current = null;
                initPlayer();
            }
        }
    }, [currentSong, nextSong, setIsPlaying]);

    // Init player when song changes
    useEffect(() => {
        if (currentSong) {
            initPlayer();
        }
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [currentSong?.youtubeId, initPlayer]);

    // Handle play/pause state changes
    useEffect(() => {
        if (!playerRef.current) return;
        try {
            const state = playerRef.current.getPlayerState?.();
            if (isPlaying && state !== 1) {
                playerRef.current.playVideo();
            } else if (!isPlaying && state === 1) {
                playerRef.current.pauseVideo();
            }
        } catch {
            // Player may not be ready yet
        }
    }, [isPlaying]);

    // Track progress
    useEffect(() => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }

        if (isPlaying && playerRef.current) {
            progressInterval.current = setInterval(() => {
                try {
                    const currentTime = playerRef.current?.getCurrentTime?.() || 0;
                    const totalDuration = playerRef.current?.getDuration?.() || 0;
                    setProgress(currentTime);
                    if (totalDuration > 0) setDuration(totalDuration);
                } catch { }
            }, 500);
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isPlaying]);

    // Handle seeking
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!playerRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const seekTime = percentage * duration;
        try {
            playerRef.current.seekTo(seekTime, true);
            setProgress(seekTime);
        } catch { }
    };

    // Cleanup on close
    useEffect(() => {
        if (!isPlayerVisible) {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch { }
                playerRef.current = null;
            }
            currentVideoId.current = null;
            setProgress(0);
            setDuration(0);
        }
    }, [isPlayerVisible]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!isPlayerVisible || !currentSong) return null;

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < playlist.length - 1;
    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <>
            {/* Spacer to prevent content from being hidden behind player */}
            <div className={isExpanded ? "h-96" : "h-24"} />

            <div
                className={`fixed bottom-0 left-0 right-0 z-50 player-backdrop transition-all duration-500 ${isExpanded ? "h-auto max-h-[80vh]" : ""
                    }`}
            >
                {/* Hidden YouTube player container */}
                <div
                    ref={playerContainerRef}
                    className="absolute w-1 h-1 opacity-0 pointer-events-none overflow-hidden"
                />

                {/* Expanded view */}
                {isExpanded && (
                    <div className="px-4 pt-4 pb-2 animate-slide-up">
                        <div className="max-w-4xl mx-auto">
                            {/* Video player */}
                            <div className="relative w-full aspect-video max-h-64 rounded-2xl overflow-hidden mb-4 bg-surface">
                                <div ref={expandedContainerRef} className="w-full h-full">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                                        allow="encrypted-media; fullscreen"
                                        className="w-full h-full"
                                        title="Now Playing"
                                    />
                                </div>
                            </div>

                            {/* Playlist queue */}
                            {playlist.length > 1 && (
                                <div className="max-h-32 overflow-y-auto mb-2 space-y-1">
                                    <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">
                                        Queue ({playlist.length} songs)
                                    </p>
                                    {playlist.map((song, i) => (
                                        <button
                                            key={song.youtubeId + "-" + i}
                                            onClick={() => {
                                                usePlayerStore.getState().playPlaylist(playlist, i);
                                            }}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${i === currentIndex
                                                ? "bg-primary/10 text-primary-light"
                                                : "hover:bg-white/5 text-text-secondary"
                                                }`}
                                        >
                                            <span className="text-xs w-5 text-center font-mono">
                                                {i === currentIndex && isPlaying ? "♪" : i + 1}
                                            </span>
                                            <span className="text-sm line-clamp-1 flex-1">
                                                {song.title}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress bar (interactive) */}
                <div
                    className="h-1 bg-white/5 cursor-pointer group"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Mini player */}
                <div className="flex items-center gap-3 px-4 py-3 max-w-7xl mx-auto">
                    {/* Song info */}
                    <div
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                            {currentSong.thumbnail ? (
                                <Image
                                    src={currentSong.thumbnail}
                                    alt={currentSong.title}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-light">
                                    <Music2 size={16} className="text-text-muted" />
                                </div>
                            )}
                            {/* Animated ring when playing */}
                            {isPlaying && (
                                <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse-glow" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white line-clamp-1">
                                {currentSong.title}
                            </p>
                            <p className="text-xs text-text-muted line-clamp-1">
                                {currentSong.channelTitle || "Unknown Artist"}
                                {duration > 0 && (
                                    <span className="ml-2">
                                        {formatTime(progress)} / {formatTime(duration)}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={prevSong}
                            disabled={!hasPrev}
                            className={`p-2 rounded-full transition-all ${hasPrev
                                ? "text-white hover:bg-white/10 active:scale-90"
                                : "text-text-muted/30 cursor-not-allowed"
                                }`}
                        >
                            <SkipBack size={18} />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="p-3 rounded-full bg-white text-background hover:scale-110 active:scale-95 transition-all duration-300 shadow-glow"
                        >
                            {isPlaying ? (
                                <Pause size={20} className="fill-current" />
                            ) : (
                                <Play size={20} className="fill-current ml-0.5" />
                            )}
                        </button>
                        <button
                            onClick={nextSong}
                            disabled={!hasNext}
                            className={`p-2 rounded-full transition-all ${hasNext
                                ? "text-white hover:bg-white/10 active:scale-90"
                                : "text-text-muted/30 cursor-not-allowed"
                                }`}
                        >
                            <SkipForward size={18} />
                        </button>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-all hidden sm:block"
                        >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                        <button
                            onClick={() => {
                                if (playerRef.current) {
                                    try { playerRef.current.destroy(); } catch { }
                                    playerRef.current = null;
                                }
                                currentVideoId.current = null;
                                closePlayer();
                            }}
                            className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
