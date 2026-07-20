const LEVELS = [
  {
    maximum: 0,
    stage: "0",
    label: "Healthy curiosity",
    message: "No symptoms filed. You may even have closed a tab voluntarily.",
  },
  {
    maximum: 2,
    stage: "1",
    label: "The polite return",
    message: "Mild conversational residue. Continue verifying answers and drinking liquids.",
  },
  {
    maximum: 5,
    stage: "3",
    label: "Prompt engineer",
    message: "Your questions now have preambles. Consider solving one small thing before optimizing how to ask about it.",
  },
  {
    maximum: 8,
    stage: "6",
    label: "Local MCP collector",
    message: "Tooling has become a hobby adjacent to the original hobby. Close one integration and observe your feelings.",
  },
  {
    maximum: 11,
    stage: "9",
    label: "Context window maximalist",
    message: "The context window remembers. Do you? Take ten minutes somewhere with a smaller token budget.",
  },
  {
    maximum: 12,
    stage: "12",
    label: "Release notes recreationalist",
    message: "The Department can offer no further satire. You have become the changelog.",
  },
];

export const MAXIMUM_SCORE = 12;

export function classifyScore(value) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const score = Math.max(0, Math.min(MAXIMUM_SCORE, Math.trunc(numericValue)));
  return LEVELS.find((level) => score <= level.maximum);
}