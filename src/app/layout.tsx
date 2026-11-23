import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TAP&C",
  description: "TAP&C — Tap and Connect",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
