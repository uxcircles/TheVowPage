const DEFAULT_COLORS = ["#a3835a", "#c9a877", "#e7d2c6", "#6b6156", "#f1e9da"];

export function launchConfetti(layer: HTMLElement, colors: string[] = DEFAULT_COLORS) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const count = 460;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const inner = document.createElement("div");
    inner.className = "confetti-inner";

    const fromLeft = i % 2 === 0;
    const originX = fromLeft ? vw * -0.03 : vw * 1.03;
    const originY = vh * 1.05;
    const dirSign = fromLeft ? 1 : -1;

    const totalX = dirSign * (vw * 0.5 + Math.random() * vw * 0.55);
    const peakY = -(vh * 0.68 + Math.random() * vh * 0.34);
    const fallY = peakY + vh * 0.65 + Math.random() * vh * 0.3;
    const dur = 1.9 + Math.random() * 0.6;

    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.setProperty("--dur", `${dur}s`);
    piece.style.setProperty("--fx", `${totalX}px`);
    inner.style.setProperty("--py", `${peakY}px`);
    inner.style.setProperty("--fy", `${fallY}px`);
    inner.style.setProperty("--rot1", `${Math.random() * 400 - 200}deg`);
    inner.style.setProperty("--rot2", `${Math.random() * 700 - 350}deg`);
    const w = 3 + Math.random() * 3.5;
    const h = 6 + Math.random() * 5;
    piece.style.width = `${w}px`;
    piece.style.height = `${h}px`;
    inner.style.background = colors[Math.floor(Math.random() * colors.length)];
    const delay = Math.random() * 2;
    piece.style.animationDelay = `${delay}s`;
    inner.style.animationDelay = piece.style.animationDelay;
    piece.appendChild(inner);
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), (delay + dur + 0.2) * 1000);
  }
}
