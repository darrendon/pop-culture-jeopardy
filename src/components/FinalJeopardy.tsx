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

  // Think music starts with the clue and stops when the answer is shown
  function showClue() {
    setCategory(false);
    setSolution(false);
    playSound("think");
  }

  function toggleSolution() {
    if (!solution) stopSound();
    setSolution(!solution);
  }

  function clueKeyPress(event: KeyboardEvent) {
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
