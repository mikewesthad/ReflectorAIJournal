import "@/app/globals.css";
import type { Metadata } from "next";
import { JournalEntriesProvider } from "@/app/JournalEntries";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Reflector Journal",
  description: "AI-powered journaling prototype for surfacing thought patterns and insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JournalEntriesProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </JournalEntriesProvider>
      </body>
    </html>
  );
}
