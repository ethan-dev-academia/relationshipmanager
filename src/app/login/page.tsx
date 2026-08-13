"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME, IS_SUPABASE_CONFIGURED } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setError(null);
    if (!IS_SUPABASE_CONFIGURED) {
      router.push("/");
      return;
    }
    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <div
          className="relative mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[20px] text-white"
          style={{
            background: "linear-gradient(150deg, #ff5c9a, var(--tint), #d81f74)",
            boxShadow: "var(--elev), inset 0 1px 0 rgba(255,255,255,.45)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.35), transparent)",
            }}
          />
          <Heart size={40} fill="white" className="relative" />
        </div>
        <h1 className="t-large c-label">{APP_NAME}</h1>
        <p className="t-subhead c-label-2 mt-1">our little world 💕</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoCapitalize="none"
          className="field"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          onKeyDown={(e) => e.key === "Enter" && signIn()}
          className="field"
        />
        {error && (
          <p
            className="t-footnote rounded-xl px-3 py-2 font-medium"
            style={{ background: "rgba(255,69,58,0.14)", color: "#ff5a52" }}
          >
            {error}
          </p>
        )}
        <button onClick={signIn} disabled={loading} className="btn-filled w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {!IS_SUPABASE_CONFIGURED && (
          <p className="t-footnote c-label-2 px-1 pt-1 text-center">
            Demo mode — Supabase isn&apos;t connected yet, so any tap signs you in.
          </p>
        )}
      </div>

      <p className="t-caption c-label-3 mt-8 text-center">
        Just the two of us. Stay signed in — no need to log in every time.
      </p>
    </div>
  );
}
