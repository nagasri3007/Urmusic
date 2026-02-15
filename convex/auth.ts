import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple hash function for passwords (in production, use bcrypt via an action)
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36) + "_" + str.length.toString(36) + "_" +
        Array.from(str).reduce((acc, ch) => acc + ch.charCodeAt(0), 0).toString(36);
}

function generateToken(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export const signup = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existing) {
            throw new Error("Email already in use");
        }

        const userId = await ctx.db.insert("users", {
            email: args.email,
            passwordHash: simpleHash(args.password),
            name: args.name,
            createdAt: Date.now(),
        });

        const token = generateToken();
        await ctx.db.insert("sessions", {
            userId,
            token,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return { userId, token };
    },
});

export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error("Invalid email or password");
        }

        if (user.passwordHash !== simpleHash(args.password)) {
            throw new Error("Invalid email or password");
        }

        const token = generateToken();
        await ctx.db.insert("sessions", {
            userId: user._id,
            token,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });

        return { userId: user._id, token, name: user.name, email: user.email };
    },
});

export const logout = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (session) {
            await ctx.db.delete(session._id);
        }
    },
});

export const getSession = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.token) return null;

        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!session || session.expiresAt < Date.now()) {
            return null;
        }

        const user = await ctx.db.get(session.userId);
        if (!user) return null;

        return {
            userId: user._id,
            email: user.email,
            name: user.name,
        };
    },
});
