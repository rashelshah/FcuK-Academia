import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";
import { DashboardDataProvider } from "@/context/DashboardDataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "@/components/layout/AppLayout";
import { getThemeBootstrapScript } from "@/lib/theme";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FcuK Academia",
  description: "the future of rebellious learning",
  manifest: "/manifest.webmanifest",
  themeColor: "#f5a24f",
  icons: {
    icon: [
      { url: "/icons/browser%20logo.jpeg", type: "image/jpeg" },
      { url: "/icons/android-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/android-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/ios%20new%20logo.jpeg", type: "image/jpeg" },
    ],
    shortcut: [
      { url: "/icons/browser%20logo.jpeg", type: "image/jpeg" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FcuK Academia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider>
          <DashboardDataProvider>
            <AppStateProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </AppStateProvider>
          </DashboardDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
