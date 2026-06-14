// Lightweight window-event channel so any component (e.g. the rating dial)
// can summon the global cursor bee to react at a screen location, without
// threading context/props through the tree.

export const BEE_EVENT = "ardy-bee-reaction";

export type BeeReaction = "sting" | "honey";

export interface BeeReactionDetail {
  type: BeeReaction;
  x: number; // viewport coords
  y: number;
}

/** Fly the bee to (x, y) and play the sting / honey animation there. */
export function emitBeeReaction(type: BeeReaction, x: number, y: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<BeeReactionDetail>(BEE_EVENT, { detail: { type, x, y } }),
  );
}
