export function initPanicProtocol() {
  const protocol = document.querySelector("#panic-protocol");

  if (!protocol) {
    return;
  }

  const instructions = protocol.querySelector(":scope > div");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let processed = false;

  protocol.addEventListener("toggle", () => {
    if (!protocol.open || processed) {
      return;
    }

    processed = true;

    if (reducedMotion.matches) {
      document.dispatchEvent(new CustomEvent("claudeholic:panic-complete"));
      return;
    }

    instructions.hidden = true;
    const loader = document.createElement("div");
    loader.className = "panic-loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-live", "polite");
    loader.innerHTML = `
      <p><span>Contacting the physical world</span><output>0%</output></p>
      <progress max="100" value="0">0%</progress>
    `;
    protocol.querySelector("summary").insertAdjacentElement("afterend", loader);

    const progress = loader.querySelector("progress");
    const output = loader.querySelector("output");
    const checkpoints = [
      [260, 17, "Locating floor"],
      [610, 42, "Negotiating with open tabs"],
      [980, 78, "Rendering nearby tree"],
      [1_350, 100, "Analog world available"],
    ];

    for (const [delay, value, label] of checkpoints) {
      window.setTimeout(() => {
        progress.value = value;
        progress.textContent = `${value}%`;
        output.textContent = `${value}% · ${label}`;
      }, delay);
    }

    window.setTimeout(() => {
      loader.remove();
      instructions.hidden = false;
      document.dispatchEvent(new CustomEvent("claudeholic:panic-complete"));
    }, 1_650);
  });
}