import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Viewport configuration for PWA
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#4f46e5" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // iOS safe area support
};

// Enhanced metadata for PWA
export const metadata: Metadata = {
  title: {
    default: "School Management System",
    template: "%s | School MS",
  },
  description:
    "ប្រព័ន្ធគ្រប់គ្រងសាលា - Complete school management system with student, teacher, and grade management",
  applicationName: "School Management System",
  authors: [{ name: "School Admin" }],
  generator: "Next.js",
  keywords: [
    "school",
    "management",
    "students",
    "teachers",
    "grades",
    "attendance",
    "education",
    "ប្រព័ន្ធគ្រប់គ្រងសាលា",
  ],
  referrer: "origin-when-cross-origin",
  creator: "School Admin",
  publisher: "School",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "School Management System",
    description: "Complete school management system",
    url: "/",
    siteName: "School Management System",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "School Management System",
    description: "Complete school management system",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "School MS",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-167x167.png", sizes: "167x167", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* iOS specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="School MS" />

        {/* MS Tile */}
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
