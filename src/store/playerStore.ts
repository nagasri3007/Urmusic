import { create } from "zustand";
import { Song } from "@/types";

interface PlayerStore {
    currentSong: Song | null;
    playlist: Song[];
    currentIndex: number;
    isPlaying: boolean;
    isPlayerVisible: boolean;

    playSong: (song: Song, playlist?: Song[]) => void;
    playPlaylist: (songs: Song[], startIndex?: number) => void;
    togglePlay: () => void;
    nextSong: () => void;
    prevSong: () => void;
    setIsPlaying: (playing: boolean) => void;
    closePlayer: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    currentSong: null,
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    isPlayerVisible: false,

    playSong: (song, playlist) => {
        const newPlaylist = playlist || [song];
        const index = newPlaylist.findIndex((s) => s.youtubeId === song.youtubeId);
        set({
            currentSong: song,
            playlist: newPlaylist,
            currentIndex: index >= 0 ? index : 0,
            isPlaying: true,
            isPlayerVisible: true,
        });
    },

    playPlaylist: (songs, startIndex = 0) => {
        if (songs.length === 0) return;
        set({
            currentSong: songs[startIndex],
            playlist: songs,
            currentIndex: startIndex,
            isPlaying: true,
            isPlayerVisible: true,
        });
    },

    togglePlay: () => {
        set((state) => ({ isPlaying: !state.isPlaying }));
    },

    nextSong: () => {
        const { playlist, currentIndex } = get();
        if (currentIndex < playlist.length - 1) {
            const nextIndex = currentIndex + 1;
            set({
                currentSong: playlist[nextIndex],
                currentIndex: nextIndex,
                isPlaying: true,
            });
        }
    },

    prevSong: () => {
        const { playlist, currentIndex } = get();
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            set({
                currentSong: playlist[prevIndex],
                currentIndex: prevIndex,
                isPlaying: true,
            });
        }
    },

    setIsPlaying: (playing) => set({ isPlaying: playing }),

    closePlayer: () =>
        set({
            currentSong: null,
            playlist: [],
            currentIndex: 0,
            isPlaying: false,
            isPlayerVisible: false,
        }),
}));
