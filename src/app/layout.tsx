import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edit Data Karyawan - Next.js + TypeScript + shadcn/ui",
  description:
    "Editable table dengan rich text editor dan filter menggunakan Next.js 14, TypeScript, dan shadcn/ui",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
