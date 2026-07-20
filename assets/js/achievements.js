const ACHIEVEMENT_KEY = "claudeholic.achievements.v1";
const VISIT_KEY = "claudeholic.visits.v1";
const SESSION_KEY = "claudeholic.session-seen.v1";

const CATALOG = {
  "self-awareness": {
    title: "Self-awareness unlocked",
    description: "Recorded at least one symptom without blaming the interface.",
  },
  "primary-source": {
    title: "Primary source enjoyer",
    description: "Opened the source instead of requesting a summary of the source.",
  },
  "touch-grass": {
    title: "Touch grass (unverified)",
    description: "Left this tab for one uninterrupted minute. Field activity remains unconfirmed.",
  },
  "repeat-visitor": {
    title: "Reopened for one question",
    description: "Returned in a new browser session. The Department kept your chair.",
  },
  "analog-protocol": {
    title: "Manual mode survivor",
    description: "Completed the emergency analog protocol without opening another model.",
  },
  "context-debt": {
    title: "Context has accrued interest",
    description: "Selected every symptom. A related case file has been attached.",
    url: "https://github.com/JGalego/tech-debt",
    linkLabel: "Review inherited technical obligations",
  },
  "terminal-mode": {
    title: "Terminally online",
    description: "Found the interface beneath the interface. This will not help your assessment.",
  },
};

function readJson(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Local achievements are optional. Privacy settings outrank fictional badges.
  }
}

export function initAchievements() {
  const visibleList = document.querySelector("[data-achievement]")?.closest("ul");
  const sourceLink = document.querySelector('a[href="https://github.com/JGalego/Claudeholic"]');
  const region = document.createElement("aside");
  const unlocked = new Set(readJson(localStorage, ACHIEVEMENT_KEY, []));
  let hiddenAt = null;

  region.className = "achievement-region";
  region.setAttribute("aria-label", "Filed achievements");
  region.setAttribute("aria-live", "polite");
  document.body.append(region);

  const renderState = (id) => {
    let item = document.querySelector(`[data-achievement="${id}"]`);
    const achievement = CATALOG[id];

    if (!item && visibleList && achievement) {
      item = document.createElement("li");
      item.dataset.achievement = id;
      item.innerHTML = `<strong>${achievement.title}</strong><span>${achievement.description}</span>`;
      visibleList.append(item);
    }

    if (!item) {
      return;
    }

    item.dataset.state = unlocked.has(id) ? "unlocked" : "locked";
    let state = item.querySelector(".achievement-state");

    if (!state) {
      state = document.createElement("span");
      state.className = "achievement-state";
      item.append(state);
    }

    state.textContent = unlocked.has(id) ? "Filed" : "Locked";
  };

  const showToast = (achievement) => {
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.setAttribute("role", "status");

    const filingLabel = document.createElement("span");
    const title = document.createElement("strong");
    const description = document.createElement("p");
    filingLabel.textContent = "Achievement filed locally";
    title.textContent = achievement.title;
    description.textContent = achievement.description;
    toast.append(filingLabel, title, description);

    if (achievement.url) {
      const link = document.createElement("a");
      link.href = achievement.url;
      link.textContent = achievement.linkLabel;
      toast.append(link);
    }

    region.append(toast);
    window.setTimeout(() => toast.remove(), 8_000);
  };

  const unlock = (id, { notify = true } = {}) => {
    const achievement = CATALOG[id];

    if (!achievement || unlocked.has(id)) {
      return;
    }

    unlocked.add(id);
    writeJson(localStorage, ACHIEVEMENT_KEY, [...unlocked]);
    renderState(id);

    if (notify) {
      showToast(achievement);
    }
  };

  for (const item of document.querySelectorAll("[data-achievement]")) {
    renderState(item.dataset.achievement);
  }

  for (const id of unlocked) {
    if (!document.querySelector(`[data-achievement="${id}"]`)) {
      renderState(id);
    }
  }

  document.addEventListener("claudeholic:score", (event) => {
    if (event.detail.score >= 1) {
      unlock("self-awareness");
    }

    if (event.detail.score === 12) {
      unlock("context-debt");
    }
  });

  document.addEventListener("claudeholic:panic-complete", () => unlock("analog-protocol"));
  sourceLink?.addEventListener("click", () => unlock("primary-source"));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenAt = Date.now();
    } else if (hiddenAt && Date.now() - hiddenAt >= 60_000) {
      unlock("touch-grass");
      hiddenAt = null;
    }
  });

  let sessionSeen = false;

  try {
    sessionSeen = sessionStorage.getItem(SESSION_KEY) === "true";
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    sessionSeen = true;
  }

  if (!sessionSeen) {
    const visits = Number(readJson(localStorage, VISIT_KEY, 0));
    writeJson(localStorage, VISIT_KEY, visits + 1);

    if (visits > 0) {
      window.setTimeout(() => unlock("repeat-visitor"), 900);
    }
  }

  return { unlock };
}