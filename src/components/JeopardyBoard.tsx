import { useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Clue, GameRound } from "../types";
import { playSound, playTimesUp, stopSound } from "../util/sounds";
import ClueMedia from "./ClueMedia";
import HostAnswer from "./HostAnswer";
import "./JeopardyBoard.css";

interface JeopardyBoardProps {
  backToBoard: () => void;
  board: GameRound;
  categoryShown: () => void;
  categoriesShown: number;
  chooseClue: (categoryIndex: number, clueIndex: number) => void;
  currentCategory: number | null;
  currentClue: number | null;
  solution: boolean;
  setSolution: (shown: boolean) => void;
  dailyDoubleShown: boolean;
  setDailyDoubleShown: (shown: boolean) => void;
  // The TV board: draws the same screens with no controls, keys or sounds
  display?: boolean;
  // Host screen while the TV board is open: show the host the response early
  hostView?: boolean;
}

function JeopardyBoard(props: JeopardyBoardProps) {
  const {
    backToBoard,
    board,
    categoryShown,
    categoriesShown,
    chooseClue,
    currentCategory,
    currentClue,
    solution,
    setSolution,
    dailyDoubleShown,
    setDailyDoubleShown,
    display = false,
    hostView = false,
  } = props;

  // Play the Daily Double sting when one is revealed; otherwise cut off
  // any round music once the host opens a clue.
  useEffect(() => {
    if (display) return;
    if (currentCategory === null || currentClue === null) return;
    if (board[currentCategory].clues[currentClue].dailyDouble) {
      playSound("daily_double");
    } else {
      stopSound();
    }
  }, [board, currentCategory, currentClue, display]);

  useEffect(() => {
    if (display) return;
    document.addEventListener("keydown", clueKeyPress);
    return () => {
      document.removeEventListener("keydown", clueKeyPress);
    };
  });

  function renderCategory(index: number) {
    return (
      <div
        onClick={display ? undefined : categoryShown}
        className="category-container"
      >
        <TransitionGroup>
          <CSSTransition key={index} timeout={1000} classNames="categorybox">
            <div className="category-box">
              <div className="category">{board[index].category}</div>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </div>
    );
  }

  function renderClue(categoryName: string, clue: Clue) {
    const showDailyDoubleScreen = clue.dailyDouble && !dailyDoubleShown;
    const onClick = display
      ? undefined
      : showDailyDoubleScreen
      ? switchDDToClue
      : solution
      ? returnToBoard
      : toggleSolution;
    return (
      <div onClick={onClick} className="clue">
        <div className="clue-category-label">
          {categoryName} - ${clue.value}
          {!display && !showDailyDoubleScreen && !solution && (
            <button
              className="host-button times-up-button"
              title="Time's up (T)"
              onClick={(event) => {
                event.stopPropagation();
                playTimesUp();
              }}
            >
              Time's up
            </button>
          )}
        </div>
        {hostView && !solution && (
          <HostAnswer
            response={clue.solution}
            html={clue.html === true}
            clue={showDailyDoubleScreen ? clue.clue : undefined}
          />
        )}
        <div
          className={
            showDailyDoubleScreen ? "clue-display daily-double" : "clue-display"
          }
        >
          <br />
          {showDailyDoubleScreen ? (
            "Daily Double"
          ) : (
            <div>
              {clue.html === true ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: solution ? clue.solution : clue.clue,
                  }}
                />
              ) : solution ? (
                clue.solution
              ) : (
                clue.clue
              )}
              {solution ? (
                <ClueMedia image={clue.solutionImage} />
              ) : (
                <ClueMedia
                  image={clue.image}
                  audio={clue.audio}
                  video={clue.video}
                  onTv={hostView}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function clueKeyPress(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT") return;

    // First check for categoriesShown
    if (
      categoriesShown < board.length &&
      (event.key === " " || event.key === "Enter")
    ) {
      categoryShown();
    }

    if (currentCategory === null || currentClue === null) {
      return;
    }
    const clue = board[currentCategory].clues[currentClue];

    if (event.key === "t" || event.key === "T") {
      playTimesUp();
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      // If we just showed the Daily Double screen, switch to the clue
      if (clue.dailyDouble && !dailyDoubleShown) {
        switchDDToClue();
      } else {
        toggleSolution();
      }
    } else if (event.key === "Escape") {
      returnToBoard();
    }
  }

  function switchDDToClue() {
    setSolution(false);
    setDailyDoubleShown(true);
  }

  function returnToBoard() {
    backToBoard();
  }

  function toggleSolution() {
    setSolution(!solution);
  }

  // First check for if we need to present categories
  if (categoriesShown < board.length) {
    return renderCategory(categoriesShown);
  }

  // Check if there is a clue to present
  if (currentCategory !== null && currentClue !== null) {
    return renderClue(
      board[currentCategory].category,
      board[currentCategory].clues[currentClue]
    );
  }

  return (
    <div className="board">
      <table>
        <thead>
          <tr>
            {board.map((category, i) => (
              <td key={i} className="category-title">
                {category.category}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {board[0].clues.map((_, j) => {
            return (
              <tr key={j}>
                {board.map((category, i) => {
                  if (category.clues[j].chosen) {
                    return <td key={i} className="board-clue"></td>;
                  }
                  return (
                    <td
                      key={i}
                      onClick={display ? undefined : () => chooseClue(i, j)}
                      className={
                        display ? "board-clue display" : "board-clue"
                      }
                    >
                      ${category.clues[j].value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default JeopardyBoard;
