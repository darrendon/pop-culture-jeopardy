import { ChangeEvent, useState } from "react";

import { GameData } from "../types";
import sample_game from "../assets/sample_game.json";
import { preloadedGames } from "../util/preloaded_games";

import "./GameLoader.css";

interface GameLoaderProps {
  updateGame: (game: GameData) => void;
}

function GameLoader(props: GameLoaderProps) {
  const { updateGame } = props;
  const [error, setError] = useState<string | null>(null);

  function handleGameUpload(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null || event.target.files.length === 0) {
      return;
    }
    event.target.files[0].text().then((text) => {
      try {
        const data: any = JSON.parse(text);
        if (data.game === undefined) {
          setError('That file is missing the "game" section.');
          return;
        }
        setError(null);
        updateGame(data);
      } catch (e) {
        setError(`That file isn't valid JSON: ${(e as Error).message}`);
      }
    });
  }

  function downloadSampleGame() {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(sample_game, null, 4)], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "sample_game.json";
    document.body.appendChild(element);
    element.click();
  }

  return (
    <div className="game-loader">
      <h1>Jeopardy Player</h1>
      <p>Based on the Jeopardy Player by Brian Yu</p>
      <hr />
      <h2>Pop Culture Jeopardy</h2>
      <div className="preloaded-games">
        <button
          onClick={() =>
            // Copy the game so a replay starts with a fresh board
            updateGame(JSON.parse(JSON.stringify(preloadedGames.pop_culture)))
          }
        >
          Episode 1
        </button>
        <button
          onClick={() =>
            updateGame(JSON.parse(JSON.stringify(preloadedGames.pop_culture_2)))
          }
        >
          Episode 2
        </button>
      </div>
      <p className="loader-note">or load a game file</p>
      <input
        type="file"
        name="file"
        accept=".json"
        onChange={handleGameUpload}
      />
      {error && <div className="loader-error">{error}</div>}
      <hr />
      <h2>Create a Game</h2>
      <div className="create-your-own">
        To create a Jeopardy game, download the below game configuration file,
        edit it to include your desired clues, and re-upload it here.
        <div>
          <button onClick={downloadSampleGame}>Download Configuration</button>
        </div>
      </div>
    </div>
  );
}

export default GameLoader;
