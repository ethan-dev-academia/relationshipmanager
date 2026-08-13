"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, SmartphoneNfc } from "lucide-react";

type Theme = "system" | "light" | "dark";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Auto", icon: SmartphoneNfc },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("us.theme") as Theme) || "system";
    setTheme(saved);
  }, []);

  const apply = (t: Theme) => {
    setTheme(t);
    if (t === "system") {
      localStorage.removeItem("us.theme");
      document.documentElement.removeAttribute("data-theme");
    } else {
      localStorage.setItem("us.theme", t);
      document.documentElement.setAttribute("data-theme", t);
    }
  };

  return (
    <div className="segmented">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          data-active={theme === o.value}
          onClick={() => apply(o.value)}
          className="segment flex items-center justify-center gap-1.5"
        >
          <o.icon size={15} />
          {o.label}
        </button>
      ))}
    </div>
  );
}
