"use client";

import { useSyncExternalStore } from "react";
import { BEE_PALETTE, BEE_SPRITE } from "./beeSprite";

export interface BeeData {
  sprite: string[];
  palette: string[];
}

const DEFAULT: BeeData = { sprite: BEE_SPRITE, palette: BEE_PALETTE };

// In-memory live override (set by the dev Bee Lab). Not persisted — a reload
// falls back to the sprite/palette in the code.
let override: BeeData | null = null;
const listeners = new Set<() => void>();

export function setLiveSprite(sprite: string[] | null, palette?: string[]) {
  override = sprite ? { sprite, palette: palette ?? BEE_PALETTE } : null;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return override ?? DEFAULT;
}

/** The bee to render: the live override if one is set, else the code one. */
export function useBee(): BeeData {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT);
}
