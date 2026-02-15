import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveSong = mutation({
    args: {
        userId: v.id("users"),
        songId: v.id("songs"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("userSavedSongs")
            .withIndex("by_userId_songId", (q) =>
                q.eq("userId", args.userId).eq("songId", args.songId)
            )
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("userSavedSongs", {
            userId: args.userId,
            songId: args.songId,
            createdAt: Date.now(),
        });
    },
});

export const unsaveSong = mutation({
    args: {
        userId: v.id("users"),
        songId: v.id("songs"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("userSavedSongs")
            .withIndex("by_userId_songId", (q) =>
                q.eq("userId", args.userId).eq("songId", args.songId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

export const getUserSavedSongs = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const saved = await ctx.db
            .query("userSavedSongs")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        const songs = [];
        for (const s of saved) {
            const song = await ctx.db.get(s.songId);
            if (song) {
                const movie = await ctx.db.get(song.movieId);
                songs.push({
                    ...song,
                    savedId: s._id,
                    savedAt: s.createdAt,
                    movieTitle: movie?.title,
                    movieYear: movie?.year,
                });
            }
        }
        return songs;
    },
});

export const isSongSaved = query({
    args: {
        userId: v.id("users"),
        songId: v.id("songs"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("userSavedSongs")
            .withIndex("by_userId_songId", (q) =>
                q.eq("userId", args.userId).eq("songId", args.songId)
            )
            .first();

        return !!existing;
    },
});

export const getUserSavedSongIds = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const saved = await ctx.db
            .query("userSavedSongs")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();

        return saved.map((s) => s.songId);
    },
});
