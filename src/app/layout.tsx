import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";

export const metadata: Metadata = {
  title: "CinemaHub - Ultimate Movie App",
  description: "Advanced Movie Discovery, Watchlist & Favorites Management, Interactive Ratings, and Reviews for Movie Enthusiasts.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] flex flex-col">
            {children}
          </main>
          {/* Global Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              <p className="font-bold text-slate-600 dark:text-slate-300">© {new Date().getFullYear()} CinemaHub. All rights reserved.</p>
              <p className="mt-1">Built with Next.js (App Router), Tailwind CSS, and Drizzle ORM on PostgreSQL.</p>
            </div>
          </footer>
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
