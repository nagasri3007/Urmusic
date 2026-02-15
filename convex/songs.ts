import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByMovieId = query({
    args: { movieId: v.id("movies") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("songs")
            .withIndex("by_movieId", (q) => q.eq("movieId", args.movieId))
            .collect();
    },
});

export const create = mutation({
    args: {
        movieId: v.id("movies"),
        title: v.string(),
        youtubeId: v.string(),
        thumbnail: v.optional(v.string()),
        channelTitle: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("songs")
            .withIndex("by_youtubeId", (q) => q.eq("youtubeId", args.youtubeId))
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("songs", {
            movieId: args.movieId,
            title: args.title,
            youtubeId: args.youtubeId,
            thumbnail: args.thumbnail,
            channelTitle: args.channelTitle,
        });
    },
});

export const createBatch = mutation({
    args: {
        songs: v.array(
            v.object({
                movieId: v.id("movies"),
                title: v.string(),
                youtubeId: v.string(),
                thumbnail: v.optional(v.string()),
                channelTitle: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const song of args.songs) {
            const existing = await ctx.db
                .query("songs")
                .withIndex("by_youtubeId", (q) => q.eq("youtubeId", song.youtubeId))
                .first();

            if (existing) {
                ids.push(existing._id);
            } else {
                const id = await ctx.db.insert("songs", song);
                ids.push(id);
            }
        }
        return ids;
    },
});

export const getById = query({
    args: { id: v.id("songs") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getMultiple = query({
    args: { ids: v.array(v.id("songs")) },
    handler: async (ctx, args) => {
        const songs = [];
        for (const id of args.ids) {
            const song = await ctx.db.get(id);
            if (song) songs.push(song);
        }
        return songs;
    },
});
