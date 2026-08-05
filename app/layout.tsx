import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INNERVIEW — Mirror Rehearsal Studio",
  description: "A distraction-free, mirror-based rehearsal studio for internalizing scripts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden antialiased">{children}</body>
    </html>
  );
}
