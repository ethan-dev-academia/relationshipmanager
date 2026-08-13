"use client";

// Small, unobtrusive control to tell this device which of the two partners it
// belongs to. Persists locally via useIdentity(). Drop it anywhere (settings
// row, under the message bar, etc.).

import { useIdentity } from "@/lib/couple";

export default function IdentityPicker({ className = "" }: { className?: string }) {
  const { meIndex, setMeIndex, names } = useIdentity();

  return (
    <div className={className}>
      <div className="segmented" role="group" aria-label="This device is">
        {names.map((name, i) => (
          <button
            key={i}
            type="button"
            data-active={meIndex === i}
            onClick={() => setMeIndex(i as 0 | 1)}
            className="segment"
            aria-pressed={meIndex === i}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
