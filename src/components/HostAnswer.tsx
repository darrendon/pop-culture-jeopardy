interface HostAnswerProps {
  response: string;
  html: boolean;
  // On a Daily Double the clue is still hidden; the host can read it here
  clue?: string;
}

// Shown only on the host screen while the TV board is open, so the host
// can read the correct response before revealing it.
function HostAnswer(props: HostAnswerProps) {
  const { response, html, clue } = props;
  return (
    <div className="host-answer" onClick={(event) => event.stopPropagation()}>
      {clue !== undefined && (
        <div className="host-answer-clue">
          <span className="host-answer-label">Clue</span>
          {html ? <span dangerouslySetInnerHTML={{ __html: clue }} /> : clue}
        </div>
      )}
      <div>
        <span className="host-answer-label">Response</span>
        {html ? <span dangerouslySetInnerHTML={{ __html: response }} /> : response}
      </div>
    </div>
  );
}

export default HostAnswer;
