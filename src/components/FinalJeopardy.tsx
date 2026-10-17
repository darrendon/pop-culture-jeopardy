import { useEffect, useState } from "react";
import { FinalRound } from "../types";
import { playSound, stopSound } from "../util/sounds";
import ClueMedia from "./ClueMedia";

interface FinalJeopardyProps {
  final: FinalRound;
  onFinishGame: () => void;
}

function FinalJeopardy(props: FinalJeopardyProps) {
  const { final, onFinishGame } = props;

  const [category, setCategory] = useState(true);
  const [solution, setSolution] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", clueKeyPress);
    return () => {
      document.removeEventListener("keydown", clueKeyPress);
    };
  });

  // Final Jeopardy music when the category appears
  useEffect(() => {
    playSound("final");
    return () => stopSound();
  }, []);

  function showClue() {
    setCategory(false);
    setSolution(false);
  }

  // The host starts and stops the think music with a button (or P)
  function toggleMusic() {
    if (musicOn) {
      stopSound();
      setMusicOn(false);
    } else if (playSound("think", () => setMusicOn(false))) {
      setMusicOn(true);
    }
  }

  function toggleSolution() {
    if (!solution) {
      stopSound();
      setMusicOn(false);
    }
    setSolution(!solution);
  }

  function clueKeyPress(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT") return;
    if ((event.key === "p" || event.key === "P") && !category && !solution) {
      toggleMusic();
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      if (category) {
        showClue();
      } else {
        toggleSolution();
      }
    } else if (event.key === "Escape" && !category && solution) {
      onFinishGame();
    }
  }

  if (category) {
    return (
      <div onClick={showClue} className="clue">
        <div className="clue-display final-category">{final.category}</div>
      </div>
    );
  }
  return (
    <div onClick={solution ? onFinishGame : toggleSolution} className="clue">
      {!solution && (
        <div className="clue-category-label">
          {final.category}
          <button
            className={musicOn ? "host-button music-on" : "host-button"}
            title="Think music (P)"
            onClick={(event) => {
              event.stopPropagation();
              toggleMusic();
            }}
          >
            {musicOn ? "Stop music" : "Play think music"}
          </button>
        </div>
      )}
      <div className="clue-display">
        <div>
          {final.html === true ? (
            <div
              dangerouslySetInnerHTML={{
                __html: solution ? final.solution : final.clue,
              }}
            />
          ) : solution ? (
            final.solution
          ) : (
            final.clue
          )}
          {solution ? (
            <ClueMedia image={final.solutionImage} />
          ) : (
            <ClueMedia
              image={final.image}
              audio={final.audio}
              video={final.video}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FinalJeopardy;
