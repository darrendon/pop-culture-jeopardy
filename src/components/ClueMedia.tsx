import { MouseEvent } from "react";
import { mediaUrl } from "../util/sounds";

interface ClueMediaProps {
  image?: string;
  audio?: string;
  video?: string;
  // Host screen with the TV board open: audio and video play on the TV only
  onTv?: boolean;
}

// Shows a clue's picture, audio clip or video under its text.
// Clicks on the media don't reveal the answer, so the host can
// press play or scrub without skipping ahead.
function ClueMedia(props: ClueMediaProps) {
  const { image, audio, video, onTv = false } = props;
  if (!image && !audio && !video) return null;

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="clue-media" onClick={stop}>
      {image && <img src={mediaUrl(image)} alt="" />}
      {onTv && (video || audio) && (
        <div className="media-on-tv">
          {video ? "Video" : "Audio"} clip plays on the TV
        </div>
      )}
      {!onTv && video && <video src={mediaUrl(video)} controls autoPlay />}
      {!onTv && audio && <audio src={mediaUrl(audio)} controls autoPlay />}
    </div>
  );
}

export default ClueMedia;
