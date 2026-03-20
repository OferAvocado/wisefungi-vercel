import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WiseFungi | Web Admin & Core",
  description: "Vercel-ready instance of WiseFungi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen relative">
        {children}
      </body>
    </html>
  );
}
