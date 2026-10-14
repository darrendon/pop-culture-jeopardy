import { useEffect, useState } from "react";

import FinalJeopardy from "./FinalJeopardy";
import GameLoader from "./GameLoader";
import JeopardyBoard from "./JeopardyBoard";
import PlayerChooser from "./PlayerChooser";
import Scoreboard from "./Scoreboard";
import {
  Game,
  GameData,
  GameRound,
  Player,
  RoundName,
  ROUND_SINGLE,
} from "../types";
import { preloadedGames } from "../util/preloaded_games";
import { playSound, toggleMute } from "../util/sounds";

import "./App.css";

function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState<RoundName>(ROUND_SINGLE);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [numCategoriesShown, setNumCategoriesShown] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<
    number | null
  >(null);
  const [currentClueIndex, setCurrentClueIndex] = useState<number | null>(null);

  // Specify a game in the query string as /?game=GAME_ID loads a pre-loaded game
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("game");
    if (gameId === null) {
      return;
    }

    const preloadedGame: GameData | undefined = (preloadedGames as any)[gameId];
    if (preloadedGame === undefined) {
      return;
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    updateGame(JSON.parse(JSON.stringify(preloadedGame)));
  }, []);

  // Press M at any point to mute or unmute the sound cues
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "m" || event.key === "M") {
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT") return;
        toggleMute();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function updateGame(data: GameData) {
    setPlayers(data.players || []);
    setRound(data.round || ROUND_SINGLE);
    setIsGameStarted(data.players !== undefined);
    setGame(data.game);
  }

  function addPlayer(name: string) {
    setPlayers([...players, { name, score: 0, correct: 0, incorrect: 0 }]);
  }

  function playGame() {
    setIsGameStarted(true);
    if (round === "single") playSound("single");
    if (round === "double") playSound("double");
  }

  function handleCategoryShown() {
    setNumCategoriesShown(numCategoriesShown + 1);
  }

  function chooseClue(categoryIndex: number, clueIndex: number) {
    let newGame: Game = Object.assign({}, game);
    let newRound: GameRound = (newGame as any)[round];
    newRound[categoryIndex].clues[clueIndex].chosen = true;
    setGame(newGame);
    setCurrentCategoryIndex(categoryIndex);
    setCurrentClueIndex(clueIndex);
  }

  function updateScore(playerIndex: number, value: number, correct: boolean) {
    const newPlayers = [...players];
    players[playerIndex].score += value;
    if (correct) players[playerIndex].correct++;
    else players[playerIndex].incorrect++;
    setPlayers(newPlayers);
  }

  function returnToBoard() {
    setCurrentClueIndex(null);
    setCurrentCategoryIndex(null);
  }

  function proceedToDouble() {
    setNumCategoriesShown(0);
    setRound("double");
    playSound("double");
  }

  function proceedToFinal() {
    setRound("final");
  }

  function finishGame() {
    setRound("done");
  }

  function downloadGame() {
    if (game === null) {
      return;
    }
    const element = document.createElement("a");
    const gameData: GameData = { game, players, round };
    const file = new Blob([JSON.stringify(gameData, null, 4)], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "game.json";
    document.body.appendChild(element);
    element.click();
  }

  if (game === null) {
    return (
      <div className="app">
        <GameLoader updateGame={updateGame} />
      </div>
    );
  }

  if (!isGameStarted) {
    return (
      <div className="app">
        <PlayerChooser
          players={players}
          addPlayer={addPlayer}
          playGame={playGame}
        />
      </div>
    );
  } else if (round === "single" || round === "double") {
    const board = game[round];
    if (board === undefined) {
      return <div>Error: Game board not found.</div>;
    }

    // See if we should be able to proceed to Double Jeopardy
    let allowProceedToDouble = round === "single";
    if (allowProceedToDouble) {
      board.forEach((category) => {
        category.clues.forEach((clue) => {
          if (clue.chosen === undefined) {
            allowProceedToDouble = false;
          }
        });
      });
    }

    let allowProceedToFinal = round === "double";
    if (allowProceedToFinal) {
      board.forEach((category) => {
        category.clues.forEach((clue) => {
          if (clue.chosen === undefined) {
            allowProceedToFinal = false;
          }
        });
      });
    }

    // Allow games configurations to skip Double Jeopardy
    if (allowProceedToDouble && game.double === undefined) {
      allowProceedToDouble = false;
      allowProceedToFinal = true;
    }

    return (
      <div className="app">
        {currentCategoryIndex === null &&
          currentClueIndex === null &&
          allowProceedToDouble && (
            <div>
              <button onClick={proceedToDouble} className="proceed-to">
                Proceed to Double Jeopardy
              </button>
            </div>
          )}
        {currentCategoryIndex === null &&
          currentClueIndex === null &&
          allowProceedToFinal && (
            <div>
              <button onClick={proceedToFinal} className="proceed-to">
                Proceed to Final Jeopardy
              </button>
            </div>
          )}

        <JeopardyBoard
          board={board}
          backToBoard={returnToBoard}
          categoryShown={handleCategoryShown}
          chooseClue={chooseClue}
          categoriesShown={numCategoriesShown}
          currentCategory={currentCategoryIndex}
          currentClue={currentClueIndex}
        />
        <Scoreboard
          players={players}
          currentValue={
            currentCategoryIndex !== null && currentClueIndex !== null
              ? board[currentCategoryIndex].clues[currentClueIndex].value
              : null
          }
          updateScore={updateScore}
          wagering={
            currentCategoryIndex !== null &&
            currentClueIndex !== null &&
            board[currentCategoryIndex].clues[currentClueIndex].dailyDouble ===
              true
          }
          stats={false}
        />
        <button onClick={downloadGame} className="download">
          Download Game in Progress
        </button>
      </div>
    );
  } else if (round === "final") {
    const final = game.final;
    return (
      <div>
        <FinalJeopardy final={final} onFinishGame={finishGame} />
        <Scoreboard
          players={players}
          currentValue={0}
          updateScore={updateScore}
          wagering={true}
          stats={false}
        />
        <button onClick={downloadGame} className="download">
          Download Game in Progress
        </button>
      </div>
    );
  } else if (round === "done") {
    return (
      <div>
        <Scoreboard
          players={players}
          currentValue={null}
          updateScore={updateScore}
          wagering={false}
          stats={true}
        />
        <button onClick={downloadGame} className="download">
          Download Game Result
        </button>
      </div>
    );
  } else {
    return <div>Error: Unknown game round.</div>;
  }
}

export default App;
