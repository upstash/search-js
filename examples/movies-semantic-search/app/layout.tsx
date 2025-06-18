import "./globals.css";
import { Metadata } from "next";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Movies Semantic Search",
  description: "Semantic search for movies and TV series using TMDB data",
  icons: {
    icon: "/favicon-32x32.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-b text-indigo-900 from-indigo-500/10">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
