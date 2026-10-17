import { useState } from "react";

import SignaturePad from "./SignaturePad";

import "./PlayerChooser.css";

const TEAM_COUNT = 4;

interface PlayerChooserProps {
  addTeams: (teams: { name: string; signature: string | null }[]) => void;
  playGame: () => void;
}

// Each team writes its name in a box; the drawings appear on the podiums.
function PlayerChooser(props: PlayerChooserProps) {
  const { addTeams, playGame } = props;
  const [signatures, setSignatures] = useState<(string | null)[]>(
    Array(TEAM_COUNT).fill(null)
  );

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
      <div className="signature-grid">
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
