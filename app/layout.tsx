import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { MobileComposeButton } from "@/components/mobile-compose";

export const metadata: Metadata = {
  title: "Orien",
  description: "Platform for Global Discourse",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-5">{children}</main>
        <MobileComposeButton />
      </body>
    </html>
  );
}
