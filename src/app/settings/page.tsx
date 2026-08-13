"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Screen from "@/components/Screen";
import { Section, Row } from "@/components/List";
import ThemeToggle from "@/components/ThemeToggle";
import IdentityPicker from "@/components/IdentityPicker";
import { MY_NAME, PARTNER_NAME, IS_SUPABASE_CONFIGURED } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  return (
    <Screen title="Settings" backHref="/" backLabel="Home">
      <AccountSection />

      <Section header="Appearance" className="pt-6" footer="Auto follows your phone's light or dark setting.">
        <div className="p-4">
          <ThemeToggle />
        </div>
      </Section>

      <Section
        header="This device"
        className="pt-6"
        footer="Pick who's using this phone so notes and games know which of you is which."
      >
        <div className="p-4">
          <IdentityPicker />
        </div>
      </Section>

      <Section header="The two of you" className="pt-6">
        <div className="flex items-center justify-center gap-3 p-5 text-center">
          <span className="t-title3 c-label">{MY_NAME}</span>
          <span className="text-xl">💗</span>
          <span className="t-title3 c-label">{PARTNER_NAME}</span>
        </div>
      </Section>
    </Screen>
  );
}

function AccountSection() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!IS_SUPABASE_CONFIGURED) return;
    const supabase = createClient();
    supabase?.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!IS_SUPABASE_CONFIGURED) {
    return (
      <Section header="Account" className="pt-1" footer="Connected to Supabase in production — you'll stay signed in.">
        <Row title="Demo mode" subtitle="No backend connected on this device" chevron={false} />
      </Section>
    );
  }

  return (
    <Section header="Account" className="pt-1" footer="You stay signed in — no need to log in each time.">
      <Row
        title="Signed in"
        subtitle={email ?? "…"}
        chevron={false}
      />
      <Row
        title={<span className="c-tint font-semibold">Sign out</span>}
        onClick={signOut}
        chevron={false}
        accessory={<LogOut size={18} className="c-tint" />}
      />
    </Section>
  );
}
