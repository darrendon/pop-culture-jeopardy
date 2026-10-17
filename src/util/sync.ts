// Keeps the TV board window in step with the host screen.
//
// The host page (the normal site address) runs the game. Opening the same
// site with ?view=board gives a board that only shows what the room should
// see. Both windows must be open in the same browser on the same computer:
// they talk over a BroadcastChannel.

import { Game, Player, RoundName } from "../types";

export const IS_BOARD =
  new URLSearchParams(window.location.search).get("view") === "board";

export type FinalStage = "category" | "clue" | "solution";

// Everything the board needs to draw the current screen
export interface BoardState {
  game: Game | null;
  players: Player[];
  round: RoundName;
  isGameStarted: boolean;
  numCategoriesShown: number;
  currentCategoryIndex: number | null;
  currentClueIndex: number | null;
  solution: boolean;
  dailyDoubleShown: boolean;
  finalStage: FinalStage;
}

export type SyncMessage =
  | { type: "state"; state: BoardState }
  | { type: "hello" } // the board just opened and wants the current state
  | { type: "ping" }; // the board is still open

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("pop-culture-jeopardy")
    : null;

export function send(message: SyncMessage) {
  if (channel) channel.postMessage(message);
}

export function listen(handler: (message: SyncMessage) => void): () => void {
  if (!channel) return () => {};
  const onMessage = (event: MessageEvent) => handler(event.data as SyncMessage);
  channel.addEventListener("message", onMessage);
  return () => channel.removeEventListener("message", onMessage);
}

export function openBoardWindow() {
  window.open(
    `${window.location.pathname}?view=board`,
    "pop-culture-jeopardy-board"
  );
}
