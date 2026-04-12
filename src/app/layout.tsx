import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { cookies } from "next/headers";
import Script from "next/script";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";
import { DashboardDataProvider } from "@/context/DashboardDataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "@/components/layout/AppLayout";
import GoogleAnalytics from "@/components/system/GoogleAnalytics";
import CommunityPopup from "@/components/system/CommunityPopup";
import ServiceWorkerRegistration from "@/components/system/ServiceWorkerRegistration";
import {
  defaultTheme,
  getThemeBootstrapScript,
  getThemeCssVariables,
  isDarkTheme,
  isValidTheme,
  THEME_COOKIE_KEY,
  themes,
} from "@/lib/theme";
import type { ThemeType } from "@/lib/types";
import { Analytics } from "@vercel/analytics/react";

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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/android-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/android-icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/browser%20logo.jpeg", type: "image/jpeg" },
    ],
    apple: [
      { url: "/icons/ios%20new%20logo.jpeg", type: "image/jpeg" },
    ],
    shortcut: [
      { url: "/icons/android-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FcuK Academia",
  },
};

export const viewport: Viewport = {
  themeColor: "#080402",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme: ThemeType = isValidTheme(cookieTheme) ? cookieTheme : defaultTheme;
  const initialThemeConfig = themes[initialTheme];
  const initialCssVariables = getThemeCssVariables(initialThemeConfig);
  const htmlStyle = Object.fromEntries(
    Object.entries(initialCssVariables).map(([key, value]) => [`--${key}`, value]),
  ) as CSSProperties;

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      data-theme-mode={initialThemeConfig.mode}
      className={isDarkTheme(initialTheme) ? "dark" : undefined}
      style={{ ...htmlStyle, colorScheme: initialThemeConfig.mode }}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: getThemeBootstrapScript(initialTheme),
          }}
        />
        <ServiceWorkerRegistration />
        <GoogleAnalytics />
        <ThemeProvider initialTheme={initialTheme}>
          <DashboardDataProvider>
            <AppStateProvider>
              <CommunityPopup />
              <AppLayout>
                {children}
              </AppLayout>
            </AppStateProvider>
          </DashboardDataProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
