import { useEffect, useRef, useState } from "react";

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
import {
  BoardState,
  FinalStage,
  IS_BOARD,
  listen,
  openBoardWindow,
  send,
} from "../util/sync";

import "./App.css";

// How the game screens are drawn: on the host's laptop, or on the TV board
interface ViewMode {
  display: boolean; // TV board: no controls
  hostView: boolean; // host screen with the board open: show responses early
}

interface Handlers {
  backToBoard: () => void;
  categoryShown: () => void;
  chooseClue: (categoryIndex: number, clueIndex: number) => void;
  setSolution: (shown: boolean) => void;
  setDailyDoubleShown: (shown: boolean) => void;
  setFinalStage: (stage: FinalStage) => void;
  updateScore: (i: number, value: number, correct: boolean) => void;
  proceedToDouble: () => void;
  proceedToFinal: () => void;
  finishGame: () => void;
  downloadGame: () => void;
}

const noop = () => {};
const BOARD_HANDLERS: Handlers = {
  backToBoard: noop,
  categoryShown: noop,
  chooseClue: noop,
  setSolution: noop,
  setDailyDoubleShown: noop,
  setFinalStage: noop,
  updateScore: noop,
  proceedToDouble: noop,
  proceedToFinal: noop,
  finishGame: noop,
  downloadGame: noop,
};

function allChosen(board: GameRound): boolean {
  return board.every((category) =>
    category.clues.every((clue) => clue.chosen !== undefined)
  );
}

// The round, clue, Final Jeopardy and results screens, shared by both windows
function renderGameScreen(
  state: BoardState,
  mode: ViewMode,
  on: Handlers
): JSX.Element {
  const { game, players, round } = state;
  if (game === null) return <div>Error: No game loaded.</div>;
  const { display, hostView } = mode;

  if (round === "single" || round === "double") {
    const board = game[round];
    if (board === undefined) {
      return <div>Error: Game board not found.</div>;
    }
    const onBoard =
      state.currentCategoryIndex === null && state.currentClueIndex === null;

    // See if we should be able to proceed to Double or Final Jeopardy
    const roundDone = allChosen(board);
    let allowProceedToDouble = round === "single" && roundDone;
    let allowProceedToFinal = round === "double" && roundDone;
    // Allow games configurations to skip Double Jeopardy
    if (allowProceedToDouble && game.double === undefined) {
      allowProceedToDouble = false;
      allowProceedToFinal = true;
    }

    const clue =
      state.currentCategoryIndex !== null && state.currentClueIndex !== null
        ? board[state.currentCategoryIndex].clues[state.currentClueIndex]
        : null;

    return (
      <div className="app game-screen">
        {!display && onBoard && allowProceedToDouble && (
          <div>
            <button onClick={on.proceedToDouble} className="proceed-to">
              Proceed to Double Jeopardy
            </button>
          </div>
        )}
        {!display && onBoard && allowProceedToFinal && (
          <div>
            <button onClick={on.proceedToFinal} className="proceed-to">
              Proceed to Final Jeopardy
            </button>
          </div>
        )}

        <div className="game-main">
          <JeopardyBoard
            board={board}
            backToBoard={on.backToBoard}
            categoryShown={on.categoryShown}
            chooseClue={on.chooseClue}
            categoriesShown={state.numCategoriesShown}
            currentCategory={state.currentCategoryIndex}
            currentClue={state.currentClueIndex}
            solution={state.solution}
            setSolution={on.setSolution}
            dailyDoubleShown={state.dailyDoubleShown}
            setDailyDoubleShown={on.setDailyDoubleShown}
            display={display}
            hostView={hostView}
          />
        </div>
        <Scoreboard
          players={players}
          currentValue={clue ? clue.value : null}
          updateScore={on.updateScore}
          wagering={clue !== null && clue.dailyDouble === true}
          stats={false}
          display={display}
        />
        {!display && (
          <button onClick={on.downloadGame} className="download">
            Download Game in Progress
          </button>
        )}
      </div>
    );
  } else if (round === "final") {
    return (
      <div className="game-screen">
        <div className="game-main">
          <FinalJeopardy
            final={game.final}
            onFinishGame={on.finishGame}
            stage={state.finalStage}
            setStage={on.setFinalStage}
            display={display}
            hostView={hostView}
          />
        </div>
        <Scoreboard
          players={players}
          currentValue={0}
          updateScore={on.updateScore}
          wagering={true}
          stats={false}
          display={display}
        />
        {!display && (
          <button onClick={on.downloadGame} className="download">
            Download Game in Progress
          </button>
        )}
      </div>
    );
  } else if (round === "done") {
    return (
      <div>
        <Scoreboard
          players={players}
          currentValue={null}
          updateScore={on.updateScore}
          wagering={false}
          stats={true}
          display={display}
        />
        {!display && (
          <button onClick={on.downloadGame} className="download">
            Download Game Result
          </button>
        )}
      </div>
    );
  }
  return <div>Error: Unknown game round.</div>;
}

// The TV board: shows whatever the host screen sends it
function BoardApp() {
  const [state, setState] = useState<BoardState | null>(null);

  useEffect(() => {
    const stop = listen((message) => {
      if (message.type === "state") setState(message.state);
    });
    send({ type: "hello" });
    const ping = window.setInterval(() => send({ type: "ping" }), 2000);
    return () => {
      stop();
      window.clearInterval(ping);
    };
  }, []);

  // F toggles full screen. Unlike F11, this kind of full screen doesn't
  // bring the browser's toolbar back when the mouse moves to the laptop.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key !== "f" && event.key !== "F") return;
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  if (state === null || state.game === null || !state.isGameStarted) {
    return (
      <div className="board-splash">
        <div className="board-splash-title">JEOPARDY!</div>
        <div className="board-splash-note">
          {state === null
            ? "Waiting for the host screen…"
            : state.game === null
            ? "The host is choosing a game"
            : "Teams are writing their names"}
        </div>
        <div className="board-splash-hint">Press F for full screen</div>
      </div>
    );
  }
  return renderGameScreen(
    state,
    { display: true, hostView: false },
    BOARD_HANDLERS
  );
}

function HostApp() {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState<RoundName>(ROUND_SINGLE);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [numCategoriesShown, setNumCategoriesShown] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<
    number | null
  >(null);
  const [currentClueIndex, setCurrentClueIndex] = useState<number | null>(null);
  const [solution, setSolution] = useState(false);
  const [dailyDoubleShown, setDailyDoubleShown] = useState(false);
  const [finalStage, setFinalStage] = useState<FinalStage>("category");
  const [boardOpen, setBoardOpen] = useState(false);

  const boardState: BoardState = {
    game,
    players,
    round,
    isGameStarted,
    numCategoriesShown,
    currentCategoryIndex,
    currentClueIndex,
    solution,
    dailyDoubleShown,
    finalStage,
  };
  const latest = useRef(boardState);
  latest.current = boardState;

  // Send every change to the TV board
  useEffect(() => {
    send({ type: "state", state: latest.current });
  });

  // Answer the board when it opens, and notice when it closes
  useEffect(() => {
    let lastSeen = 0;
    const stop = listen((message) => {
      if (message.type === "hello") {
        send({ type: "state", state: latest.current });
      }
      if (message.type === "hello" || message.type === "ping") {
        lastSeen = Date.now();
        setBoardOpen(true);
      }
    });
    const check = window.setInterval(() => {
      setBoardOpen(Date.now() - lastSeen < 6000);
    }, 2000);
    return () => {
      stop();
      window.clearInterval(check);
    };
  }, []);

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

  // A clicked button keeps keyboard focus, so the next Space (meant to
  // reveal the answer) would click it again, e.g. adding a score twice.
  // Let go of the focus after every click.
  useEffect(() => {
    function release(event: MouseEvent) {
      const button = (event.target as HTMLElement).closest("button");
      if (button) button.blur();
    }
    document.addEventListener("click", release);
    return () => document.removeEventListener("click", release);
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

  function addTeams(teams: { name: string; signature: string | null }[]) {
    setPlayers((existing) => [
      ...existing,
      ...teams.map((team) => ({
        name: team.name,
        signature: team.signature,
        score: 0,
        correct: 0,
        incorrect: 0,
      })),
    ]);
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
    setSolution(false);
    setDailyDoubleShown(false);
    setCurrentCategoryIndex(categoryIndex);
    setCurrentClueIndex(clueIndex);
  }

  function updateScore(playerIndex: number, value: number, correct: boolean) {
    setPlayers((existing) =>
      existing.map((player, i) =>
        i === playerIndex
          ? {
              ...player,
              score: player.score + value,
              correct: player.correct + (correct ? 1 : 0),
              incorrect: player.incorrect + (correct ? 0 : 1),
            }
          : player
      )
    );
  }

  function returnToBoard() {
    setSolution(false);
    setDailyDoubleShown(false);
    setCurrentClueIndex(null);
    setCurrentCategoryIndex(null);
  }

  function proceedToDouble() {
    setNumCategoriesShown(0);
    setRound("double");
    playSound("double");
  }

  function proceedToFinal() {
    setFinalStage("category");
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

  const boardButton = (
    <button
      className={boardOpen ? "board-button board-on" : "board-button"}
      onClick={openBoardWindow}
      title={
        boardOpen
          ? "The TV board is open in another window"
          : "Open the board window to put on the TV"
      }
    >
      📺 {boardOpen ? "Board on" : "Open board"}
    </button>
  );

  let screen: JSX.Element;
  if (game === null) {
    screen = (
      <div className="app">
        <GameLoader updateGame={updateGame} />
      </div>
    );
  } else if (!isGameStarted) {
    screen = (
      <div className="app">
        <PlayerChooser addTeams={addTeams} playGame={playGame} />
      </div>
    );
  } else {
    screen = renderGameScreen(
      boardState,
      { display: false, hostView: boardOpen },
      {
        backToBoard: returnToBoard,
        categoryShown: handleCategoryShown,
        chooseClue,
        setSolution,
        setDailyDoubleShown,
        setFinalStage,
        updateScore,
        proceedToDouble,
        proceedToFinal,
        finishGame,
        downloadGame,
      }
    );
  }

  return (
    <>
      {screen}
      {boardButton}
    </>
  );
}

function App() {
  return IS_BOARD ? <BoardApp /> : <HostApp />;
}

export default App;
