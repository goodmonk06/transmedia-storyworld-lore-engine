import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transmedia Storyworld Lore Engine",
  description: "Build, explore, and export storyworld lore across different media formats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
