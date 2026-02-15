import { NextRequest, NextResponse } from "next/server";

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    try {
        // Check for aliases/synonyms
        const ALIASES: Record<string, string> = {
            "bala krishna": "Nandamuri Balakrishna",
            "balakrishna": "Nandamuri Balakrishna",
            "pawan kalyan": "Pawan Kalyan",
            "pk": "Pawan Kalyan",
            "power star": "Pawan Kalyan",
            "chiranjeevi": "Chiranjeevi",
            "chiru": "Chiranjeevi",
            "megastar": "Chiranjeevi",
            "ntr": "N.T. Rama Rao Jr.",
            "jr ntr": "N.T. Rama Rao Jr.",
            "prabhas": "Prabhas",
            "mahesh babu": "Mahesh Babu",
            "superstar": "Mahesh Babu",
            "allu arjun": "Allu Arjun",
            "bunny": "Allu Arjun",
            "ram charan": "Ram Charan",
            "cherry": "Ram Charan",
            "vijay": "Joseph Vijay",
            "thalapathy": "Joseph Vijay",
            "ajith": "Ajith Kumar",
            "thala": "Ajith Kumar",
            "kamal haasan": "Kamal Haasan",
            "rajinikanth": "Rajinikanth",
            "superstar rajini": "Rajinikanth",
            "suria": "Suriya",
            "suriya": "Suriya",
            "vikram": "Vikram",
            "dhanush": "Dhanush",
            "simbu": "Silambarasan",
            "str": "Silambarasan",
        };

        const normalizedQuery = query.toLowerCase().trim();
        const effectiveQuery = ALIASES[normalizedQuery] || query;

        console.log(`Searching TMDB for: "${effectiveQuery}" (Original: "${query}")`);

        // Search for the person
        const searchRes = await fetch(
            `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(effectiveQuery)}&language=en-US&page=1`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                    Accept: "application/json",
                },
            }
        );

        if (!searchRes.ok) {
            throw new Error(`TMDB search failed: ${searchRes.status}`);
        }

        const searchData = await searchRes.json();

        if (searchData.results.length === 0) {
            return NextResponse.json({ actor: null, movies: [] });
        }

        console.log("Top TMDB Result:", JSON.stringify(searchData.results[0]?.name));

        // Filter for actors only (known_for_department === "Acting")
        // Then sort by popularity descending to get the most relevant match
        const actorResults = searchData.results
            .filter((p: any) => p.known_for_department === "Acting")
            .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));

        if (actorResults.length === 0) {
            // If no exact "Acting" match, try all results but prioritize actors
            const fallback = searchData.results
                .sort((a: any, b: any) => {
                    // Prioritize "Acting" department
                    if (a.known_for_department === "Acting" && b.known_for_department !== "Acting") return -1;
                    if (a.known_for_department !== "Acting" && b.known_for_department === "Acting") return 1;
                    return (b.popularity || 0) - (a.popularity || 0);
                });

            if (fallback.length === 0) {
                return NextResponse.json({ actor: null, movies: [] });
            }
        }

        const actor = actorResults.length > 0 ? actorResults[0] : searchData.results[0];

        // Get their movie credits
        const creditsRes = await fetch(
            `${TMDB_BASE_URL}/person/${actor.id}/movie_credits?language=en-US`,
            {
                headers: {
                    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                    Accept: "application/json",
                },
            }
        );

        if (!creditsRes.ok) {
            throw new Error(`TMDB credits failed: ${creditsRes.status}`);
        }

        const creditsData = await creditsRes.json();

        // Use cast credits (movies the person acted in), sort by release date ascending
        // Filter: must have a title, a release date, and year <= 2026
        const movies = creditsData.cast
            .filter((m: any) => {
                if (!m.release_date || !m.title) return false;
                const year = new Date(m.release_date).getFullYear();
                return year <= 2026 && year >= 1900;
            })
            // Remove duplicates by tmdb id
            .filter((m: any, index: number, self: any[]) =>
                index === self.findIndex((t) => t.id === m.id)
            )
            // Sort ascending by release date (earliest first)
            .sort((a: any, b: any) => {
                const dateA = new Date(a.release_date).getTime();
                const dateB = new Date(b.release_date).getTime();
                return dateA - dateB;
            })
            .map((m: any) => ({
                id: m.id,
                title: m.title,
                release_date: m.release_date,
                year: m.release_date
                    ? new Date(m.release_date).getFullYear()
                    : null,
                poster_path: m.poster_path
                    ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    : null,
                overview: m.overview,
                character: m.character || null,
            }));

        return NextResponse.json({
            actor: {
                id: actor.id,
                name: actor.name,
                profile_path: actor.profile_path
                    ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                    : null,
                known_for_department: actor.known_for_department,
                popularity: actor.popularity,
            },
            movies,
        });
    } catch (error: any) {
        console.error("TMDB API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch from TMDB" },
            { status: 500 }
        );
    }
}
