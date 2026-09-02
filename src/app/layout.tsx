import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import SuppressBenignErrors from "@/components/SuppressBenignErrors";

export const metadata: Metadata = {
  title: "sFixied - Sistem Penggadaian Modern",
  description: "Platform penggadaian gadget terpercaya dengan sistem pencatatan digital.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f2f7",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased overflow-x-hidden">
        <SuppressBenignErrors />
        {children}
      </body>
    </html>
  );
}