import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "CONNECTO — Random Video & Text Chat",
  description:
    "Meet real people instantly. Random video and text chat with strangers worldwide. No sign-up required.",
  keywords: ["random chat", "video chat", "omegle alternative", "anonymous chat"],
  openGraph: {
    title: "CONNECTO",
    description: "Meet real people instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-bg text-text">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
