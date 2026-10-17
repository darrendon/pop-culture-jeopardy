import { PointerEvent, useEffect, useRef } from "react";

interface SignaturePadProps {
  label: string;
  onChange: (signature: string | null) => void;
}

const BACKGROUND = "#001699";
const INK = "white";

// A box players write their team name in with a finger, stylus or mouse,
// like the light-pen names on the show's podiums.
function SignaturePad(props: SignaturePadProps) {
  const { label, onChange } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    paintBackground();
  }, []);

  function context(): CanvasRenderingContext2D | null {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext("2d") : null;
  }

  function paintBackground() {
    const canvas = canvasRef.current;
    const ctx = context();
    if (!canvas || !ctx) return;
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function clear() {
    paintBackground();
    hasInk.current = false;
    onChange(null);
  }

  function pointFrom(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function strokeTo(point: { x: number; y: number }) {
    const ctx = context();
    const from = last.current;
    if (!ctx || !from) return;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;
    hasInk.current = true;
  }

  function handleDown(event: PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const point = pointFrom(event);
    last.current = point;
    // A tap still leaves a dot
    strokeTo({ x: point.x + 0.1, y: point.y + 0.1 });
  }

  function handleMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    event.preventDefault();
    strokeTo(pointFrom(event));
  }

  function handleUp() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (hasInk.current && canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  }

  return (
    <div className="signature-pad">
      <div className="signature-label">{label}</div>
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onPointerLeave={handleUp}
      />
      <button className="signature-clear" onClick={clear}>
        Clear
      </button>
    </div>
  );
}

export default SignaturePad;
