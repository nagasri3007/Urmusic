"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import { SearchPageSkeleton } from "@/components/Skeletons";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/store/authStore";
import { Song } from "@/types";
import { Id } from "@convex/_generated/dataModel";
import Image from "next/image";
import { User, Film, Music2, AlertCircle, Search } from "lucide-react";
import toast from "react-hot-toast";

interface ActorResult {
    id: number;
    name: string;
    profile_path: string | null;
}

interface MovieResult {
    id: number;
    title: string;
    year: number | null;
    poster_path: string | null;
    overview: string;
}

interface SongResult {
    videoId: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
}

interface ProcessedMovie {
    title: string;
    year?: number;
    posterUrl?: string;
    tmdbId: number;
    overview?: string;
    convexId: string;
    songs: Song[];
    songsLoaded: boolean;
    songsLoading: boolean;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [isLoading, setIsLoading] = useState(false);
    const [actor, setActor] = useState<ActorResult | null>(null);
    const [movies, setMovies] = useState<ProcessedMovie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingPhase, setLoadingPhase] = useState("");
    const [actorConvexId, setActorConvexId] = useState<string | null>(null);
    const [quotaWarning, setQuotaWarning] = useState(false);

    const { userId } = useAuthStore();

    const createActor = useMutation(api.actors.create);
    const createMoviesBatch = useMutation(api.movies.createBatch);
    const createSongsBatch = useMutation(api.songs.createBatch);
    const addSearch = useMutation(api.searchHistory.addSearch);

    // Check cache
    const cachedActor = useQuery(
        api.actors.getByTmdbId,
        actor?.id ? { tmdbId: actor.id } : "skip"
    );

    const cachedMovies = useQuery(
        api.movies.getByActorId,
        cachedActor?._id ? { actorId: cachedActor._id } : "skip"
    );

    // Fetch songs for a specific movie (lazy loading - called on expand)
    const fetchSongsForMovie = useCallback(
        async (movieIndex: number) => {
            const movie = movies[movieIndex];
            if (!movie || movie.songsLoaded || movie.songsLoading) return;

            // Mark as loading
            setMovies((prev) => {
                const updated = [...prev];
                updated[movieIndex] = { ...updated[movieIndex], songsLoading: true };
                return updated;
            });

            try {
                const res = await fetch(
                    `/api/youtube?q=${encodeURIComponent(
                        movie.title + " movie songs"
                    )}&maxResults=5`
                );

                if (res.ok) {
                    const data = await res.json();
                    const videos: SongResult[] = data.videos || [];

                    if (data.quotaExceeded) {
                        setQuotaWarning(true);
                        toast.error("YouTube API quota exceeded. Try again tomorrow.");
                    }

                    let songs: Song[] = [];

                    if (videos.length > 0) {
                        // Save songs to Convex
                        try {
                            const songIds = await createSongsBatch({
                                songs: videos.map((s: SongResult) => ({
                                    movieId: movie.convexId as Id<"movies">,
                                    title: s.title,
                                    youtubeId: s.videoId,
                                    thumbnail: s.thumbnail || undefined,
                                    channelTitle: s.channelTitle || undefined,
                                })),
                            });

                            songs = videos.map((s: SongResult, i: number) => ({
                                _id: songIds[i] as Id<"songs">,
                                movieId: movie.convexId as Id<"movies">,
                                title: s.title,
                                youtubeId: s.videoId,
                                thumbnail: s.thumbnail,
                                channelTitle: s.channelTitle,
                            }));
                        } catch {
                            // If Convex save fails, still show songs without IDs
                            songs = videos.map((s: SongResult) => ({
                                _id: "" as Id<"songs">,
                                movieId: movie.convexId as Id<"movies">,
                                title: s.title,
                                youtubeId: s.videoId,
                                thumbnail: s.thumbnail,
                                channelTitle: s.channelTitle,
                            }));
                        }
                    }

                    setMovies((prev) => {
                        const updated = [...prev];
                        updated[movieIndex] = {
                            ...updated[movieIndex],
                            songs,
                            songsLoaded: true,
                            songsLoading: false,
                        };
                        return updated;
                    });
                } else {
                    throw new Error("Failed to fetch");
                }
            } catch (err) {
                console.error(`Failed to fetch songs for ${movie.title}:`, err);
                setMovies((prev) => {
                    const updated = [...prev];
                    updated[movieIndex] = {
                        ...updated[movieIndex],
                        songsLoaded: true,
                        songsLoading: false,
                    };
                    return updated;
                });
            }
        },
        [movies, createSongsBatch]
    );

    const performSearch = useCallback(async () => {
        if (!query) return;

        setIsLoading(true);
        setError(null);
        setMovies([]);
        setActor(null);
        setQuotaWarning(false);

        try {
            // Step 1: Search TMDB for actor
            setLoadingPhase("Searching for hero...");
            const tmdbRes = await fetch(
                `/api/tmdb?q=${encodeURIComponent(query)}`
            );
            if (!tmdbRes.ok) throw new Error("Failed to search TMDB");
            const tmdbData = await tmdbRes.json();

            if (!tmdbData.actor) {
                setError(`No actor found for "${query}". Try a different search.`);
                setIsLoading(false);
                return;
            }

            setActor(tmdbData.actor);

            // Step 2: Save actor to Convex
            setLoadingPhase("Loading filmography...");
            const actorId = await createActor({
                name: tmdbData.actor.name,
                tmdbId: tmdbData.actor.id,
                profilePath: tmdbData.actor.profile_path || undefined,
            });

            setActorConvexId(actorId as string);

            // Log search
            addSearch({
                query: tmdbData.actor.name,
                actorId: actorId,
                userId: userId ? (userId as Id<"users">) : undefined,
            });

            // Step 3: Save movies to Convex (full filmography)
            // Step 3: Save movies to Convex (complete filmography)
            const moviesToSave = tmdbData.movies;
            const movieIds = await createMoviesBatch({
                movies: moviesToSave.map((m: MovieResult) => ({
                    actorId: actorId,
                    title: m.title,
                    year: m.year || undefined,
                    posterUrl: m.poster_path || undefined,
                    tmdbId: m.id,
                    overview: m.overview || undefined,
                })),
            });

            const processedMovies: ProcessedMovie[] = moviesToSave.map(
                (m: MovieResult, i: number) => ({
                    title: m.title,
                    year: m.year || undefined,
                    posterUrl: m.poster_path || undefined,
                    tmdbId: m.id,
                    overview: m.overview || undefined,
                    convexId: movieIds[i],
                    songs: [],
                    songsLoaded: false,
                    songsLoading: false,
                })
            );

            setMovies(processedMovies);
            setLoadingPhase("");
        } catch (err: any) {
            console.error("Search error:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [query, userId, createActor, createMoviesBatch, addSearch]);

    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalSongs = movies.reduce(
        (sum, movie) => sum + movie.songs.length,
        0
    );

    return (
        <div className="px-4 py-8 max-w-4xl mx-auto">
            {/* Search bar */}
            <div className="mb-8">
                <SearchBar initialQuery={query} size="md" />
            </div>

            {/* Quota warning */}
            {quotaWarning && (
                <div className="glass-card p-4 mb-6 border border-accent-warm/30 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="text-accent-warm flex-shrink-0" />
                        <p className="text-sm text-text-secondary">
                            YouTube API daily quota has been exceeded. Song loading is temporarily unavailable.
                            Quota resets at midnight Pacific Time.
                        </p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="glass-card p-8 text-center animate-fade-in">
                    <AlertCircle size={48} className="mx-auto mb-4 text-accent-warm" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Oops!
                    </h3>
                    <p className="text-text-secondary">{error}</p>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="space-y-6">
                    {loadingPhase && (
                        <div className="glass-card p-4 flex items-center gap-3 animate-pulse-glow">
                            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Music2 size={16} className="text-primary animate-spin-slow" />
                            </div>
                            <span className="text-sm text-text-secondary font-medium">
                                {loadingPhase}
                            </span>
                        </div>
                    )}
                    <SearchPageSkeleton />
                </div>
            )}

            {/* Results */}
            {!isLoading && !error && actor && (
                <div className="space-y-6 animate-fade-in">
                    {/* Actor info */}
                    <div className="glass-card p-6 flex items-center gap-5">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-surface">
                            {actor.profile_path ? (
                                <Image
                                    src={actor.profile_path}
                                    alt={actor.name}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-light">
                                    <User size={32} className="text-text-muted" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                {actor.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                                    <Film size={14} />
                                    {movies.length} movies
                                </span>
                                {totalSongs > 0 && (
                                    <span className="flex items-center gap-1.5 text-sm text-text-secondary">
                                        <Music2 size={14} />
                                        {totalSongs} songs loaded
                                    </span>
                                )}
                                <span className="text-xs text-text-muted italic">
                                    Tap a movie to load its songs
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Movies list */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Film size={18} className="text-primary" />
                            Filmography
                        </h3>
                        <div className="space-y-3">
                            {movies.map((movie, i) => (
                                <MovieCard
                                    key={movie.convexId}
                                    title={movie.title}
                                    year={movie.year}
                                    posterUrl={movie.posterUrl}
                                    overview={movie.overview}
                                    songs={movie.songs}
                                    index={i}
                                    songsLoading={movie.songsLoading}
                                    songsLoaded={movie.songsLoaded}
                                    onExpand={() => fetchSongsForMovie(i)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && !actor && !query && (
                <div className="text-center py-20 animate-fade-in">
                    <Search size={64} className="mx-auto mb-6 text-text-muted/30" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Search for a Hero
                    </h3>
                    <p className="text-text-secondary text-sm max-w-md mx-auto">
                        Enter the name of any movie actor to discover their complete
                        filmography and song playlists.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="px-4 py-8 max-w-4xl mx-auto">
                    <SearchPageSkeleton />
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}
