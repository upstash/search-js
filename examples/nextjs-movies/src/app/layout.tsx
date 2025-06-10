"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@ant-design/v5-patch-for-react-19';
import { SearchBar } from "./search-bar";
import { Suspense } from "react";
import { Spin } from "antd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-emerald-50 flex flex-col">
          <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spin size="large" /></div>}>
            <SearchBar />
            <main className="flex-1 p-4">
              {children}
            </main>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
