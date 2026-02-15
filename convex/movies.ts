import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByActorId = query({
    args: { actorId: v.id("actors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("movies")
            .withIndex("by_actorId", (q) => q.eq("actorId", args.actorId))
            .collect();
    },
});

export const getByTmdbId = query({
    args: { tmdbId: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("movies")
            .withIndex("by_tmdbId", (q) => q.eq("tmdbId", args.tmdbId))
            .first();
    },
});

export const create = mutation({
    args: {
        actorId: v.id("actors"),
        title: v.string(),
        year: v.optional(v.number()),
        posterUrl: v.optional(v.string()),
        tmdbId: v.number(),
        overview: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("movies")
            .withIndex("by_tmdbId", (q) => q.eq("tmdbId", args.tmdbId))
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("movies", {
            actorId: args.actorId,
            title: args.title,
            year: args.year,
            posterUrl: args.posterUrl,
            tmdbId: args.tmdbId,
            overview: args.overview,
        });
    },
});

export const createBatch = mutation({
    args: {
        movies: v.array(
            v.object({
                actorId: v.id("actors"),
                title: v.string(),
                year: v.optional(v.number()),
                posterUrl: v.optional(v.string()),
                tmdbId: v.number(),
                overview: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const movie of args.movies) {
            const existing = await ctx.db
                .query("movies")
                .withIndex("by_tmdbId", (q) => q.eq("tmdbId", movie.tmdbId))
                .first();

            if (existing) {
                ids.push(existing._id);
            } else {
                const id = await ctx.db.insert("movies", movie);
                ids.push(id);
            }
        }
        return ids;
    },
});
