// Progressive filters for the approved ledger. Without JavaScript the full
// ledger simply remains visible, which was always the fallback plan.
const filterHost = document.querySelector("[data-field-note-filters]");
const chipset = document.querySelector("[data-field-note-chipset]");
const count = document.querySelector("[data-field-note-count]");
const notes = [...document.querySelectorAll("[data-field-note-id]")];

if (filterHost && chipset && count && notes.length > 0) {
  const categories = new Map();

  for (const note of notes) {
    const slug = note.dataset.fieldNoteCategory;

    if (!categories.has(slug)) {
      const label = note.querySelector("div span:last-child")?.textContent?.trim() ?? slug;
      categories.set(slug, label);
    }
  }

  let activeCategory = "all";

  const applyFilter = () => {
    let visible = 0;

    for (const note of notes) {
      const shown = activeCategory === "all" || note.dataset.fieldNoteCategory === activeCategory;
      note.hidden = !shown;
      visible += shown ? 1 : 0;
    }

    count.textContent =
      activeCategory === "all"
        ? `All ${notes.length} approved record(s) on display.`
        : `${visible} of ${notes.length} record(s) match the selected category.`;

    for (const chip of chipset.querySelectorAll("button")) {
      chip.setAttribute("aria-pressed", String(chip.dataset.category === activeCategory));
    }
  };

  const createChip = (slug, label) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.dataset.category = slug;
    chip.textContent = label;
    chip.setAttribute("aria-pressed", String(slug === activeCategory));
    chip.addEventListener("click", () => {
      activeCategory = slug;
      applyFilter();
    });
    return chip;
  };

  chipset.append(createChip("all", "All categories"));

  for (const [slug, label] of [...categories.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    chipset.append(createChip(slug, label));
  }

  filterHost.hidden = false;
  applyFilter();
}
