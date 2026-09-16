import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fungo Italia — Beta",
  description: "Aree di ricerca, atlante tassonomico e segnalazioni verificate per cercatori e micologi in Italia.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
