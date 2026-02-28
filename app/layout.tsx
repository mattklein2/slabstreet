import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SlabStreet — Sports Card Market Intelligence",
  description: "The Bloomberg Terminal for card collectors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}