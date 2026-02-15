import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByTmdbId = query({
    args: { tmdbId: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("actors")
            .withIndex("by_tmdbId", (q) => q.eq("tmdbId", args.tmdbId))
            .first();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        tmdbId: v.number(),
        profilePath: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("actors")
            .withIndex("by_tmdbId", (q) => q.eq("tmdbId", args.tmdbId))
            .first();

        if (existing) return existing._id;

        return await ctx.db.insert("actors", {
            name: args.name,
            tmdbId: args.tmdbId,
            profilePath: args.profilePath,
            createdAt: Date.now(),
        });
    },
});

export const getMovies = query({
    args: { actorId: v.id("actors") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("movies")
            .withIndex("by_actorId", (q) => q.eq("actorId", args.actorId))
            .collect();
    },
});
