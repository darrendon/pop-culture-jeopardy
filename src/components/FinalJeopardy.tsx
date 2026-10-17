import { useEffect, useState } from "react";
import { FinalRound } from "../types";
import { playSound, stopSound } from "../util/sounds";
import { FinalStage } from "../util/sync";
import ClueMedia from "./ClueMedia";
import HostAnswer from "./HostAnswer";

interface FinalJeopardyProps {
  final: FinalRound;
  onFinishGame: () => void;
  stage: FinalStage;
  setStage: (stage: FinalStage) => void;
  // The TV board: no controls, keys or sounds
  display?: boolean;
  // Host screen while the TV board is open: show the response early
  hostView?: boolean;
}

function FinalJeopardy(props: FinalJeopardyProps) {
  const {
    final,
    onFinishGame,
    stage,
    setStage,
    display = false,
    hostView = false,
  } = props;

  const category = stage === "category";
  const solution = stage === "solution";
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    if (display) return;
    document.addEventListener("keydown", clueKeyPress);
    return () => {
      document.removeEventListener("keydown", clueKeyPress);
    };
  });

  // Final Jeopardy music when the category appears
  useEffect(() => {
    if (display) return;
    playSound("final");
    return () => stopSound();
  }, [display]);

  function showClue() {
    setStage("clue");
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
    setStage(solution ? "clue" : "solution");
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

  const hostAnswer = hostView && !solution && (
    <HostAnswer
      response={final.solution}
      html={final.html === true}
      clue={category ? final.clue : undefined}
    />
  );

  if (category) {
    return (
      <div onClick={display ? undefined : showClue} className="clue">
        {hostAnswer}
        <div className="clue-display final-category">{final.category}</div>
      </div>
    );
  }
  return (
    <div
      onClick={display ? undefined : solution ? onFinishGame : toggleSolution}
      className="clue"
    >
      {!solution && (
        <div className="clue-category-label">
          {final.category}
          {!display && (
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
          )}
        </div>
      )}
      {hostAnswer}
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
              onTv={hostView}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FinalJeopardy;
