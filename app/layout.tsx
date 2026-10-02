import type { Metadata } from "next";
import "./globals.css";
import { OfflineStatus } from "@/components/offline-status";

export const metadata: Metadata = {
  title: "Fungo Italia — Atlante e studio micologico",
  description: "Atlante, percorsi di studio e consultazione sul campo per cercatori, studenti di micologia e micologi contributori.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">{children}<OfflineStatus /></body>
    </html>
  );
}
