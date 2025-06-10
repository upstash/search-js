"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, Input, Switch } from "antd";
import Link from "next/link";
import '@ant-design/v5-patch-for-react-19';
import { upsertData } from "./actions";

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
  const [query, setQuery] = useState("");
  const [reranking, setReranking] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();
  const [isLocalhost, setIsLocalhost] = useState(false);


  const searchParams = useSearchParams();
  const sarchQuery = searchParams.get("query");

  useEffect(() => {
    if (typeof sarchQuery === "string") {
      setQuery(sarchQuery);
    }
  }, [sarchQuery, setQuery])

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      setIsLocalhost(true);
    }
  }, []);

  const toggleReranking = (checked: boolean) => {
    if (checked) {
      setIsModalVisible(true);
    }
    setReranking(checked);
  };

  const handleSubmit = () => {
    router.push(`/?query=${query}&reranking=${reranking}`);
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-emerald-50 flex flex-col">
          <header className="bg-emerald-700 text-white p-4 flex justify-center">
            <div className="w-full max-w-4xl flex justify-between items-center">
              <Link href="/" className="text-lg font-semibold text-white cursor-pointer" onClick={() => {
                setQuery("")}}>
                Home
              </Link>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex items-center gap-4 text-base"
              >
                <Input
                  placeholder="Search..."
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuery(e.target.value)
                  }
                  className="w-64"
                />
                <Switch
                  checked={reranking}
                  onChange={toggleReranking}
                  className="bg-emerald-500 cursor-pointer"
                />
                Reranking
                <button
                  type="submit"
                  disabled={!query}
                  className="bg-emerald-500 px-4 rounded-md hover:bg-emerald-600 cursor-pointer h-8 transition-colors"
                >
                  Search
                </button>
              </form>
              {isLocalhost ? (
                <button
                  onClick={async () => {
                    await upsertData();
                  }}
                  className="bg-red-500 px-4 rounded-md hover:bg-red-600 cursor-pointer h-8 transition-colors"
                >
                  Upsert Data
                </button>
              ) : (
                <div className="w-0" />
              )}
            </div>
          </header>
          <main className="flex-1 p-4">
            {children}
          </main>
          <Modal
            title="Warning"
            open={isModalVisible}
            onOk={() => setIsModalVisible(false)}
            onCancel={() => setIsModalVisible(false)}
          >
            <p>Enabling reranking is expensive. Please proceed with caution.</p>
            <Link
              href="https://upstash.com/pricing/search"
              className="text-sm underline"
            >
              Pricing
            </Link>
          </Modal>
        </div>
      </body>
    </html>
  );
}
