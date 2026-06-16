"use client";

import { useSyncExternalStore } from "react";
import { BEE_SPRITE } from "./beeSprite";

// In-memory live override for the bee sprite (set by the dev Bee Lab). Not
// persisted — a reload falls back to BEE_SPRITE in the code.
let override: string[] | null = null;
const listeners = new Set<() => void>();

export function setLiveSprite(s: string[] | null) {
  override = s;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return override ?? BEE_SPRITE;
}

/** The sprite to render: the live override if one is set, else the code one. */
export function useBeeSprite(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => BEE_SPRITE);
}
