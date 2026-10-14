import { MouseEvent } from "react";
import { mediaUrl } from "../util/sounds";

interface ClueMediaProps {
  image?: string;
  audio?: string;
  video?: string;
}

// Shows a clue's picture, audio clip or video under its text.
// Clicks on the media don't reveal the answer, so the host can
// press play or scrub without skipping ahead.
function ClueMedia(props: ClueMediaProps) {
  const { image, audio, video } = props;
  if (!image && !audio && !video) return null;

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="clue-media" onClick={stop}>
      {image && <img src={mediaUrl(image)} alt="" />}
      {video && <video src={mediaUrl(video)} controls autoPlay />}
      {audio && <audio src={mediaUrl(audio)} controls autoPlay />}
    </div>
  );
}

export default ClueMedia;
