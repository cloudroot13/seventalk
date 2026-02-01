"use client";

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // 🆕 Impede zoom
  userScalable: false, // 🆕 Não permite zoom manual
  viewportFit: 'cover' // 🆕 Melhor para notch/iPhone
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-zoom">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}