"use client";

import { useRef } from "react";
import { Plus, X, ImageIcon } from "lucide-react";
import { usePersistent, makeId } from "@/lib/store";

type Photo = { id: string; src: string; at: string };

/** Downscale a picked image to keep localStorage small; returns a data URL. */
function downscale(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AlbumRail() {
  const [photos, setPhotos] = usePersistent<Photo[]>("us.album", []);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const added: Photo[] = [];
    for (const f of files) {
      try {
        const src = await downscale(f);
        added.push({ id: makeId(), src, at: new Date().toISOString() });
      } catch {
        /* skip unreadable file */
      }
    }
    if (added.length) {
      try {
        setPhotos([...added, ...photos]);
      } catch {
        alert("Storage is full — remove a few photos first.");
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (id: string) => setPhotos(photos.filter((p) => p.id !== id));

  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
      <button
        onClick={() => inputRef.current?.click()}
        className="flex h-32 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-separator bg-fill c-label-2 active:scale-95"
      >
        <Plus size={22} />
        <span className="t-caption font-semibold">Add</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onPick}
      />

      {photos.length === 0 ? (
        <div className="flex h-32 flex-1 items-center gap-2 rounded-2xl bg-fill px-4 c-label-3">
          <ImageIcon size={18} />
          <span className="t-footnote">Add your favorite moments together</span>
        </div>
      ) : (
        photos.map((p) => (
          <div
            key={p.id}
            className="relative h-32 w-24 shrink-0 overflow-hidden rounded-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => remove(p.id)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
              aria-label="Remove photo"
            >
              <X size={14} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
