"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Clock, Gamepad2, Sparkles, House } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/quizzes", label: "Quizzes", icon: Sparkles },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/stats", label: "Us", icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="glass pointer-events-auto flex w-full max-w-[380px] items-stretch justify-around rounded-[26px] px-1.5 py-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-[3px] rounded-[20px] py-2 transition-transform active:scale-95"
              style={{ color: active ? "var(--tint)" : "var(--label-2)" }}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-[20px]"
                  style={{ background: "var(--tint-bg)" }}
                />
              )}
              <Icon
                size={23}
                strokeWidth={active ? 2.5 : 2}
                fill={active && href === "/stats" ? "var(--tint)" : "none"}
                className="relative"
              />
              <span className="relative text-[10px] font-semibold tracking-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
