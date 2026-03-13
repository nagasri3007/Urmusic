import { NextRequest, NextResponse } from "next/server";

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
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
            "nithin": "Nithiin",
        };

        const normalizedQuery = query.toLowerCase().trim();
        const aliasedQuery = ALIASES[normalizedQuery] || null;

        const promises = [];

        // 1. Always search raw query
        promises.push(
            fetch(
                `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&language=en-US&page=1`,
                {
                    headers: {
                        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                        Accept: "application/json",
                    },
                }
            ).then(res => res.json())
        );

        // 2. Search alias query if it exists
        if (aliasedQuery && aliasedQuery !== query) {
            promises.push(
                fetch(
                    `${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(aliasedQuery)}&language=en-US&page=1`,
                    {
                        headers: {
                            Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                            Accept: "application/json",
                        },
                    }
                ).then(res => res.json())
            );
        }

        const resultsArrays = await Promise.all(promises);
        
        let combinedResults: any[] = [];
        resultsArrays.forEach(data => {
            if (data && data.results) {
                combinedResults = [...combinedResults, ...data.results];
            }
        });

        // Deduplicate by ID
        const uniqueResultsMap = new Map();
        combinedResults.forEach(actor => {
            if (!uniqueResultsMap.has(actor.id)) {
                uniqueResultsMap.set(actor.id, actor);
            }
        });
        const finalResults = Array.from(uniqueResultsMap.values());
        
        // Filter for actors only, sort by popularity descending, and map to suggestion format
        const suggestions = finalResults
            .filter((p: any) => p.known_for_department === "Acting")
            .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 5) // top 5 suggestions
            .map((actor: any) => ({
                id: actor.id,
                name: actor.name,
                profile_path: actor.profile_path
                    ? `https://image.tmdb.org/t/p/w92${actor.profile_path}`
                    : null,
            }));

        return NextResponse.json({ suggestions });
    } catch (error: any) {
        console.error("TMDB Suggest API error:", error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}
