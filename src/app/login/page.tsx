"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import GlassCard from "@/components/GlassCard";
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

    // Demo mode: no backend configured yet — just let them in to explore the UI.
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
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 animate-float items-center justify-center rounded-[1.75rem] bg-gradient-to-b from-rose-400 to-rose-500 text-white shadow-glass-lg">
          <Heart size={40} fill="white" />
        </div>
        <h1 className="text-3xl font-extrabold text-rose-900">{APP_NAME}</h1>
        <p className="text-sm text-rose-500/80">our little world 💕</p>
      </div>

      <GlassCard strong className="w-full max-w-sm">
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoCapitalize="none"
            className="w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-rose-900 placeholder:text-rose-300 outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            onKeyDown={(e) => e.key === "Enter" && signIn()}
            className="w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-rose-900 placeholder:text-rose-300 outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={signIn}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in 💞"}
          </button>
        </div>

        {!IS_SUPABASE_CONFIGURED && (
          <p className="mt-4 rounded-2xl bg-white/50 p-3 text-center text-xs text-rose-500">
            Demo mode — Supabase isn&apos;t connected yet, so any tap signs you in.
            Add your keys to <code>.env.local</code> to enable real accounts.
          </p>
        )}
      </GlassCard>

      <p className="mt-6 text-center text-xs text-rose-400/70">
        Just the two of us. Stay signed in — no need to log in every time.
      </p>
    </div>
  );
}
