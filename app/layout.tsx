import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
    title: "AgentLens · Product actions for founders",
    description: "See privacy-safe product actions without wrestling with analytics tooling.",
    icons: { icon: "/favicon.svg" }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
