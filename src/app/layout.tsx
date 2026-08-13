import type { Metadata, Viewport } from "next";
import { Bitter } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/config";
import BottomNav from "@/components/BottomNav";
import ServiceWorker from "@/components/ServiceWorker";

// Clean, friendly slab serif with roomy spacing — used across the whole app
// (self-hosted via next/font).
const serif = Bitter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0b0e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Applies the saved theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('us.theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={serif.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ServiceWorker />
        <main className="mx-auto min-h-dvh w-full max-w-md pb-[calc(env(safe-area-inset-bottom)+96px)]">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
