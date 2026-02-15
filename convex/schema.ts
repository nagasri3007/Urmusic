import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  actors: defineTable({
    name: v.string(),
    tmdbId: v.number(),
    profilePath: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tmdbId", ["tmdbId"]),

  movies: defineTable({
    actorId: v.id("actors"),
    title: v.string(),
    year: v.optional(v.number()),
    posterUrl: v.optional(v.string()),
    tmdbId: v.number(),
    overview: v.optional(v.string()),
  })
    .index("by_actorId", ["actorId"])
    .index("by_tmdbId", ["tmdbId"]),

  songs: defineTable({
    movieId: v.id("movies"),
    title: v.string(),
    youtubeId: v.string(),
    thumbnail: v.optional(v.string()),
    channelTitle: v.optional(v.string()),
  })
    .index("by_movieId", ["movieId"])
    .index("by_youtubeId", ["youtubeId"]),

  userSavedSongs: defineTable({
    userId: v.id("users"),
    songId: v.id("songs"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_songId", ["userId", "songId"]),

  searchHistory: defineTable({
    userId: v.optional(v.id("users")),
    query: v.string(),
    actorId: v.optional(v.id("actors")),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
