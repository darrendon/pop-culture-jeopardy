import { CSSProperties, useState } from "react";

import SignaturePad from "./SignaturePad";

import "./PlayerChooser.css";

const MIN_TEAMS = 1;
const MAX_TEAMS = 6;
const DEFAULT_TEAMS = 4;
const STORAGE_KEY = "jeopardy-team-count";

// Start with however many teams played last time on this computer
function savedTeamCount(): number {
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(n) && n >= MIN_TEAMS && n <= MAX_TEAMS) return n;
  } catch (e) {}
  return DEFAULT_TEAMS;
}

interface PlayerChooserProps {
  addTeams: (teams: { name: string; signature: string | null }[]) => void;
  playGame: () => void;
}

// Each team writes its name in a box; the drawings appear on the podiums.
function PlayerChooser(props: PlayerChooserProps) {
  const { addTeams, playGame } = props;
  const [signatures, setSignatures] = useState<(string | null)[]>(() =>
    Array(savedTeamCount()).fill(null)
  );
  const teamCount = signatures.length;

  // Changing the count keeps the names already written in the boxes that stay
  function setTeamCount(count: number) {
    setSignatures((existing) =>
      Array.from({ length: count }, (_, i) => existing[i] ?? null)
    );
    try {
      localStorage.setItem(STORAGE_KEY, String(count));
    } catch (e) {}
  }

  function setSignature(index: number, signature: string | null) {
    setSignatures((existing) =>
      existing.map((s, i) => (i === index ? signature : s))
    );
  }

  function start() {
    addTeams(
      signatures.map((signature, i) => ({ name: `Team ${i + 1}`, signature }))
    );
    playGame();
  }

  return (
    <div className="player-chooser">
      <h1>Write your team name</h1>
      <div className="team-count">
        <span className="team-count-label">Teams</span>
        {Array.from({ length: MAX_TEAMS - MIN_TEAMS + 1 }, (_, i) => {
          const count = MIN_TEAMS + i;
          return (
            <button
              key={count}
              className={count === teamCount ? "selected" : undefined}
              onClick={() => setTeamCount(count)}
            >
              {count}
            </button>
          );
        })}
      </div>
      <div
        className="signature-grid"
        style={
          {
            "--columns": teamCount === 4 ? 2 : Math.min(teamCount, 3),
          } as CSSProperties
        }
      >
        {signatures.map((_, i) => (
          <SignaturePad
            key={i}
            label={`Team ${i + 1}`}
            onChange={(signature) => setSignature(i, signature)}
          />
        ))}
      </div>
      <button className="play-game-button" onClick={start}>
        Play Game
      </button>
    </div>
  );
}

export default PlayerChooser;
