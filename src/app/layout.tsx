import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME } from "@/lib/config";
import BottomNav from "@/components/BottomNav";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: `${APP_NAME} — our little world`,
  description: "A cozy space for us: stats, timeline, games and quizzes.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  icons: {
    icon: "/icons/icon.svg",
    // Swap to a 180x180 PNG for the crispest iOS home-screen icon (see README).
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6fa0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ServiceWorker />
        <main className="mx-auto min-h-dvh w-full max-w-md pb-28">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
