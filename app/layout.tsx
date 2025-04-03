import "@/app/globals.css";
import type { Metadata } from "next";
import { JournalEntriesProvider } from "@/app/JournalEntries";

export const metadata: Metadata = {
  title: "Reflector Journal",
  description: "AI-powered journaling prototype for surfacing thought patterns and insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JournalEntriesProvider>{children}</JournalEntriesProvider>
      </body>
    </html>
  );
}
