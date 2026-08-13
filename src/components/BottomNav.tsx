"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Clock, Gamepad2, Sparkles, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/quizzes", label: "Quizzes", icon: Sparkles },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/stats", label: "Us", icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="glass-strong flex w-full max-w-md items-center justify-around rounded-[2rem] px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition",
                active ? "text-rose-600" : "text-rose-400/60"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl transition",
                  active && "bg-white/70 shadow-soft"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
