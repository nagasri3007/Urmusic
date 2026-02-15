import { NextRequest, NextResponse } from "next/server";

// Optional: YouTube Data API key as fallback, but only used as last resort
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Scrape YouTube search results from HTML (no API key needed, no quota limits).
 * This extracts video data from YouTube's server-rendered `ytInitialData` JSON.
 */
async function searchYouTubeDirect(query: string, maxResults: number): Promise<any[]> {
    try {
        // sp=EgIQAQ%3D%3D filters for "Videos" only
        const res = await fetch(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                signal: AbortSignal.timeout(10000),
            }
        );

        if (!res.ok) {
            console.error(`YouTube HTML fetch failed: ${res.status}`);
            return [];
        }

        const html = await res.text();

        // Extract ytInitialData JSON from the HTML
        const match = html.match(/var ytInitialData = ({.*?});/s);
        if (!match) {
            console.error("Could not find ytInitialData in YouTube HTML");
            return [];
        }

        let data;
        try {
            data = JSON.parse(match[1]);
        } catch (e: any) {
            console.error("Failed to parse ytInitialData JSON:", e.message);
            return [];
        }

        // Navigate to the video results
        const contents =
            data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
                ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer
                ?.contents || [];

        const videos = contents
            .filter((c: any) => c.videoRenderer)
            .slice(0, maxResults)
            .map((c: any) => {
                const renderer = c.videoRenderer;
                const videoId = renderer.videoId;
                const title = renderer.title?.runs?.[0]?.text || "Unknown";
                const channelTitle =
                    renderer.ownerText?.runs?.[0]?.text ||
                    renderer.shortBylineText?.runs?.[0]?.text ||
                    "Unknown";

                return {
                    videoId,
                    title,
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    channelTitle,
                };
            });

        return videos;
    } catch (err: any) {
        console.error("YouTube direct search error:", err.message);
        return [];
    }
}

/**
 * YouTube Data API v3 search (requires API key, has daily quota limits).
 * Used as fallback only.
 */
async function searchWithYouTubeAPI(query: string, maxResults: number): Promise<any[]> {
    if (!YOUTUBE_API_KEY) return [];

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
                query
            )}&type=video&maxResults=${maxResults}&videoCategoryId=10&key=${YOUTUBE_API_KEY}`
        );

        if (!res.ok) return [];

        const data = await res.json();

        return (data.items || []).map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail:
                item.snippet.thumbnails.high?.url ||
                item.snippet.thumbnails.medium?.url ||
                item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
        }));
    } catch {
        return [];
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const maxResults = parseInt(searchParams.get("maxResults") || "5", 10);

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter 'q' is required" },
            { status: 400 }
        );
    }

    try {
        // Strategy 1: Direct YouTube HTML scraping (no API key, no quota)
        let videos = await searchYouTubeDirect(query, maxResults);
        if (videos.length > 0) {
            return NextResponse.json({ videos, source: "direct" });
        }

        // Strategy 2: Fallback to YouTube Data API v3 (has quota limits)
        videos = await searchWithYouTubeAPI(query, maxResults);
        if (videos.length > 0) {
            return NextResponse.json({ videos, source: "youtube-api" });
        }

        return NextResponse.json({
            videos: [],
            source: "none",
            error: "No results found. Try a different search term.",
        });
    } catch (error: any) {
        console.error("Song search error:", error);
        return NextResponse.json(
            { videos: [], error: error.message || "Failed to search for songs" },
            { status: 200 }
        );
    }
}
