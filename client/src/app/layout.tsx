import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Provider";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Discuss — Real-time Communication Platform",
  description:
    "Discuss is a real-time communication platform inspired by Discord, built in Dec 2025. Users can create and join servers, chat through text channels, and communicate using low-latency voice rooms powered by WebSockets and WebRTC via mediasoup. Built with Next.js, Node.js, TanStack Query, Zustand, Hono, WebSockets, and WebRTC.",
  icons: {
    icon: "/logo.svg",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased`}
      >
              <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Providers>
        </ThemeProvider>

      </body>
    </html>
  );
}
