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
    <html lang="en">
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
