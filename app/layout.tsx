import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Berkah Oleh-Oleh",
  description: "Katalog pusat oleh-oleh dengan harga terbaik.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Toaster position="top-center" />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}