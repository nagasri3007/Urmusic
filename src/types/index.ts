import { Id } from "@convex/_generated/dataModel";

export interface Actor {
    _id: Id<"actors">;
    name: string;
    tmdbId: number;
    profilePath?: string;
    createdAt: number;
}

export interface Movie {
    _id: Id<"movies">;
    actorId: Id<"actors">;
    title: string;
    year?: number;
    posterUrl?: string;
    tmdbId: number;
    overview?: string;
}

export interface Song {
    _id: Id<"songs">;
    movieId: Id<"movies">;
    title: string;
    youtubeId: string;
    thumbnail?: string;
    channelTitle?: string;
}

export interface SavedSong extends Song {
    savedId: Id<"userSavedSongs">;
    savedAt: number;
    movieTitle?: string;
    movieYear?: number;
}

export interface User {
    userId: Id<"users">;
    email: string;
    name?: string;
}

export interface TMDBPerson {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
}

export interface TMDBMovie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    overview: string;
}

export interface YouTubeVideo {
    id: { videoId: string };
    snippet: {
        title: string;
        thumbnails: {
            default: { url: string };
            medium: { url: string };
            high: { url: string };
        };
        channelTitle: string;
    };
}

export interface SearchResult {
    actor: {
        name: string;
        tmdbId: number;
        profilePath?: string;
        convexId: string;
    };
    movies: {
        title: string;
        year?: number;
        posterUrl?: string;
        tmdbId: number;
        convexId: string;
        songs: {
            title: string;
            youtubeId: string;
            thumbnail?: string;
            channelTitle?: string;
            convexId: string;
        }[];
    }[];
}

export interface PlayerState {
    currentSong: Song | null;
    playlist: Song[];
    currentIndex: number;
    isPlaying: boolean;
    isMinimized: boolean;
}
