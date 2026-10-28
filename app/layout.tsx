import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DealMemory · Activation Memory & Copilot for AI SaaS",
  description: "Remember user goals, detect onboarding friction, and guide users to real value before checkout.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
