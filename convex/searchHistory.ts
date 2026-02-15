import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addSearch = mutation({
    args: {
        query: v.string(),
        actorId: v.optional(v.id("actors")),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("searchHistory", {
            query: args.query,
            actorId: args.actorId,
            userId: args.userId,
            createdAt: Date.now(),
        });
    },
});

export const getRecentSearches = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;
        const searches = await ctx.db
            .query("searchHistory")
            .withIndex("by_createdAt")
            .order("desc")
            .take(limit);

        // Deduplicate by query
        const seen = new Set<string>();
        const unique = [];
        for (const search of searches) {
            const key = search.query.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(search);
            }
        }
        return unique.slice(0, 6);
    },
});
