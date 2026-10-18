"use client";

import dynamic from "next/dynamic";

/** Lazy wrapper so the dev-only switcher is its own chunk — production never requests it. */
const PaletteSwitcher = dynamic(() => import("./PaletteSwitcher"), { ssr: false });

export default function DevPaletteSwitcher() {
  return <PaletteSwitcher />;
}
