"use client";

import Screen from "@/components/Screen";
import { Section } from "@/components/List";
import ThemeToggle from "@/components/ThemeToggle";
import IdentityPicker from "@/components/IdentityPicker";
import { MY_NAME, PARTNER_NAME } from "@/lib/config";

export default function SettingsPage() {
  return (
    <Screen title="Settings" backHref="/" backLabel="Home">
      <Section header="Appearance" className="pt-1" footer="Auto follows your phone's light or dark setting.">
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
