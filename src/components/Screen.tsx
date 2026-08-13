"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * iOS 26 "Liquid Glass" screen shell. Content scrolls edge-to-edge beneath a
 * large title that collapses into a frosted inline title bar. Nav accessories
 * (back button, trailing action) float above the content as glass capsules.
 */
export default function Screen({
  title,
  trailing,
  backHref,
  backLabel = "Back",
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 34);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      {/* Frosted inline title strip (fades in on scroll) */}
      <div
        className="safe-top fixed inset-x-0 top-0 z-40 mx-auto max-w-md transition-opacity duration-300"
        style={{
          opacity: collapsed ? 1 : 0,
          background: "var(--glass-bg)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          boxShadow: "inset 0 -0.5px 0 var(--separator)",
        }}
      >
        <div className="flex h-12 items-center justify-center">
          <span className="t-headline c-label">{title}</span>
        </div>
      </div>

      {/* Floating glass nav accessories */}
      <div className="safe-top fixed inset-x-0 top-0 z-50 mx-auto flex max-w-md items-center justify-between px-3">
        <div className="flex h-12 items-center">
          {backHref && (
            <Link
              href={backHref}
              className="glass glass-btn px-3"
              aria-label={backLabel}
            >
              <ChevronLeft size={22} strokeWidth={2.4} className="-ml-1" />
              <span className="t-callout font-medium">{backLabel}</span>
            </Link>
          )}
        </div>
        <div className="flex h-12 items-center">
          {trailing && <div className="glass glass-btn px-3">{trailing}</div>}
        </div>
      </div>

      {/* Large title */}
      <div className="safe-top">
        <div className="px-5 pb-2 pt-[56px]">
          <h1 className="t-large c-label">{title}</h1>
        </div>
      </div>

      <div className="pb-10">{children}</div>
    </div>
  );
}
