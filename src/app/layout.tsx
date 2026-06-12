import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "../components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EzyImposter - Social Deduction Game",
  description: "A premium real-time multiplayer social deduction party game.",
};

import { Toaster } from 'react-hot-toast';
import { ServerChecker } from '../components/ui/ServerChecker';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <div className="fixed inset-0 z-[-1] bg-background">
          {/* Subtle background glow effects */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]" />
        </div>
        <Providers>
          <Toaster position="top-center" toastOptions={{ style: { background: '#1E293B', color: '#fff' } }} />
          <ServerChecker />
          <main className="min-h-screen flex flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
