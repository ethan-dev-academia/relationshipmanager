"use client";

import { useEffect } from "react";

/** Registers the PWA service worker so the app is installable / offline-capable. */
export default function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore registration errors */
      });
    }
  }, []);
  return null;
}
