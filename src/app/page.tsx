"use client";

import SearchBar from "@/components/SearchBar";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Music,
  Headphones,
  Star,
  TrendingUp,
  Disc3,
  Sparkles,
} from "lucide-react";

const featuredHeroes = [
  {
    name: "Mahesh Babu",
    image: "🎬",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    name: "Hrithik Roshan",
    image: "🌟",
    gradient: "from-amber-500 to-red-600",
  },
  {
    name: "Tom Cruise",
    image: "🎥",
    gradient: "from-red-500 to-orange-600",
  },
  {
    name: "Shah Rukh Khan",
    image: "👑",
    gradient: "from-yellow-500 to-amber-600",
  },
  {
    name: "Allu Arjun",
    image: "🔥",
    gradient: "from-orange-500 to-red-600",
  },
  {
    name: "Prabhas",
    image: "⚡",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    name: "Ram Charan",
    image: "🎭",
    gradient: "from-green-500 to-teal-600",
  },
  {
    name: "Ranveer Singh",
    image: "💫",
    gradient: "from-pink-500 to-rose-600",
  },
];

export default function HomePage() {
  const recentSearches = useQuery(api.searchHistory.getRecentSearches, {
    limit: 6,
  });
  const router = useRouter();

  const handleHeroClick = (name: string) => {
    router.push(`/search?q=${encodeURIComponent(name)}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background orbs */}
      <div className="floating-orb w-96 h-96 bg-primary top-20 -left-48" />
      <div className="floating-orb w-80 h-80 bg-accent top-60 -right-40" />
      <div className="floating-orb w-64 h-64 bg-primary-dark bottom-40 left-1/3" />

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 sm:pt-32 sm:pb-24 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-medium text-text-secondary">
              Discover Movie Songs by Your Favorite Heroes
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 animate-slide-up leading-tight">
            Your{" "}
            <span className="gradient-text animate-gradient bg-clip-text">
              Hero&apos;s Music
            </span>
            <br />
            One Search Away
          </h1>

          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-12 animate-fade-in leading-relaxed">
            Search any movie hero and instantly explore their complete
            filmography with curated YouTube playlists. Save your favorites and
            build your perfect collection.
          </p>

          {/* Search */}
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <SearchBar size="lg" showSuggestions />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Music, label: "Songs", value: "YouTube Powered" },
            { icon: Headphones, label: "Quality", value: "HD Audio" },
            { icon: Star, label: "Experience", value: "Premium UI" },
            { icon: TrendingUp, label: "Updated", value: "Real-time" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="glass-card p-4 text-center animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <stat.icon
                size={24}
                className="mx-auto mb-2 text-primary-light"
              />
              <p className="text-sm font-bold text-white">{stat.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Heroes */}
      <section className="relative px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-primary/10">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Trending Heroes
              </h2>
              <p className="text-sm text-text-muted">
                Popular actors to explore
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredHeroes.map((hero, i) => (
              <button
                key={hero.name}
                onClick={() => handleHeroClick(hero.name)}
                className="glass-card p-6 text-center group animate-fade-in hover:!transform hover:!-translate-y-3"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${hero.gradient} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  {hero.image}
                </div>
                <p className="font-semibold text-white text-sm">{hero.name}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Searches */}
      {recentSearches && recentSearches.length > 0 && (
        <section className="relative px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-accent/10">
                <Disc3 size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Recently Searched
                </h2>
                <p className="text-sm text-text-muted">
                  Continue where you left off
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {recentSearches.map((search) => (
                <button
                  key={search._id}
                  onClick={() => handleHeroClick(search.query)}
                  className="px-5 py-2.5 rounded-full bg-white/5 border border-white/8 text-text-secondary hover:text-white hover:bg-white/10 hover:border-primary/30 transition-all duration-300 text-sm font-medium"
                >
                  {search.query}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative px-4 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-text-muted">
            Made with ❤️ using Next.js, Convex, and YouTube •{" "}
            <span className="gradient-text font-semibold">UrMusic</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
