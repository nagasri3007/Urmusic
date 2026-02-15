import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import Navbar from "@/components/Navbar";
import PlayerBar from "@/components/PlayerBar";

export const metadata: Metadata = {
  title: "UrMusic - Hero Movie Songs Finder",
  description:
    "Discover and play movie songs from your favorite heroes. Search any actor and explore their complete filmography with YouTube-powered playlists.",
  keywords: [
    "movie songs",
    "hero songs",
    "bollywood music",
    "tollywood music",
    "youtube music",
    "movie playlist",
  ],
  openGraph: {
    title: "UrMusic - Hero Movie Songs Finder",
    description:
      "Discover and play movie songs from your favorite heroes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background">
        <ConvexClientProvider>
          <ToastProvider />
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
          <PlayerBar />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
