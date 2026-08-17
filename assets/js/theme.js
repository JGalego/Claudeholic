// The night shift. Self-running on every page so the shift follows the visitor.
// Modes: auto (defer to the operating system), night, day.
const THEME_KEY = "claudeholic.theme.v1";
const MODES = ["auto", "night", "day"];
const NIGHT_SURFACE = "#181812";
const DAY_SURFACE = "#f3efe6";

const darkPreference = matchMedia("(prefers-color-scheme: dark)");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

let mode = "auto";

try {
  const stored = localStorage.getItem(THEME_KEY);

  if (MODES.includes(stored)) {
    mode = stored;
  }
} catch {
  // Preference unavailable. Auto is a fine way to live.
}

const isNight = () => mode === "night" || (mode === "auto" && darkPreference.matches);

const button = document.createElement("button");
button.type = "button";
button.className = "theme-shift";

const apply = () => {
  if (mode === "auto") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = mode;
  }

  themeColorMeta?.setAttribute("content", isNight() ? NIGHT_SURFACE : DAY_SURFACE);
  button.textContent = `Shift: ${mode}`;
  button.setAttribute(
    "aria-label",
    `Display shift, currently ${mode}${mode === "auto" ? (isNight() ? " (night)" : " (day)") : ""}. Activate to change.`,
  );
};

button.addEventListener("click", () => {
  mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];

  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // The preference will last until this page does. Acceptable.
  }

  apply();
});

darkPreference.addEventListener?.("change", apply);

const host = document.querySelector(".docket-nav") ?? document.querySelector(".publication-nav") ?? document.querySelector(".error-docket");
host?.append(button);
apply();
