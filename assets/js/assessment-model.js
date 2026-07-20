const LEVELS = [
  {
    maximum: 0,
    stage: "0",
    label: "Healthy curiosity",
    message: "No symptoms filed. You may even have closed a tab voluntarily.",
    guidance: {
      title: "Protect the habit",
      action: "Keep verifying confident answers, leave private material out, and stop when the useful work is done.",
      steps: [
        "Check consequential claims against a primary source.",
        "Keep secrets and personal data outside the prompt.",
        "Leave the conversation when the question is answered.",
      ],
    },
  },
  {
    maximum: 2,
    stage: "1",
    label: "The polite return",
    message: "Mild conversational residue. Continue verifying answers and drinking liquids.",
    guidance: {
      title: "Keep the tool in its lane",
      action: "Read before pasting, decide what done means, and keep one human source in the loop.",
      steps: [
        "Read the error or source once before requesting a summary.",
        "Set a stopping condition before opening the chat.",
        "Ask a person when judgment matters more than speed.",
      ],
    },
  },
  {
    maximum: 5,
    stage: "3",
    label: "Prompt engineer",
    message: "Your questions now have preambles. Consider solving one small thing before optimizing how to ask about it.",
    guidance: {
      title: "Preserve the first draft",
      action: "Attempt the next small problem unaided, then use AI to critique rather than replace the attempt.",
      steps: [
        "Give yourself fifteen model-free minutes first.",
        "Explain the returned answer in your own words.",
        "Remove private context before requesting critique.",
      ],
    },
  },
  {
    maximum: 8,
    stage: "6",
    label: "Local MCP collector",
    message: "Tooling has become a hobby adjacent to the original hobby. Close one integration and observe your feelings.",
    guidance: {
      title: "Audit the automation",
      action: "Disconnect one unused tool, review permissions, and complete one task through the underlying interface.",
      steps: [
        "Remove an integration that has not earned its access.",
        "Review what connected tools can read and change.",
        "Practice the manual workflow you are automating.",
      ],
    },
  },
  {
    maximum: 11,
    stage: "9",
    label: "Context window maximalist",
    message: "The context window remembers. Do you? Take ten minutes somewhere with a smaller token budget.",
    guidance: {
      title: "Reclaim your attention",
      action: "Define the outcome before the session, cap the time, and verify the result away from the chat.",
      steps: [
        "Write the intended outcome in one sentence.",
        "Use a timer that ends rather than celebrates a streak.",
        "Validate the final work in its real environment.",
      ],
    },
  },
  {
    maximum: 12,
    stage: "12",
    label: "Release notes recreationalist",
    message: "The Department can offer no further satire. You have become the changelog.",
    guidance: {
      title: "Return authorship to the room",
      action: "Schedule a model-free work block, invite a human collaborator, and make something with no optimization target.",
      steps: [
        "Protect one uninterrupted hour without a model.",
        "Ask a human to challenge the premise, not polish the output.",
        "Keep one hobby that cannot be benchmarked.",
      ],
    },
  },
];

export const MAXIMUM_SCORE = 12;

export function classifyScore(value) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const score = Math.max(0, Math.min(MAXIMUM_SCORE, Math.trunc(numericValue)));
  return LEVELS.find((level) => score <= level.maximum);
}

function reportHash(value) {
  let hash = 2_166_136_261;

  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return (hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(-7);
}

export function createAssessmentReport(value, seed = "public-record") {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const score = Math.max(0, Math.min(MAXIMUM_SCORE, Math.trunc(numericValue)));
  const classification = classifyScore(score);
  const caseNumber = `DPH-${String(score).padStart(2, "0")}-${reportHash(`${score}:${String(seed)}`)}`;
  const text = [
    "DEPARTMENTAL ASSESSMENT REPORT",
    `Case ${caseNumber}`,
    `Prompt Withdrawal Index: ${score}/${MAXIMUM_SCORE}`,
    `Stage ${classification.stage}: ${classification.label}`,
    `Finding: ${classification.message}`,
    `Recommended next step: ${classification.guidance.action}`,
    "Generated locally by claudeholic.me. Not a medical diagnosis.",
  ].join("\n");

  return {
    caseNumber,
    score,
    maximumScore: MAXIMUM_SCORE,
    stage: classification.stage,
    label: classification.label,
    finding: classification.message,
    guidance: classification.guidance,
    text,
  };
}