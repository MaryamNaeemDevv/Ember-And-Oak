import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Ember & Oak — Modern Furniture",
  description: "Furniture built from the frame out.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
