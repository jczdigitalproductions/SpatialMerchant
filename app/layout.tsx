import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spatial Merchant — Holographic Showroom",
  description:
    "Explore a curated collection in an interactive 3D showroom, with WebXR for compatible headsets.",
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
