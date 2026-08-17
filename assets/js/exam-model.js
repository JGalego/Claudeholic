// Six exhibits, two stamps, one entirely fictional credential.
export const EXHIBITS = [
  {
    id: "EXH-01",
    prompt:
      "Here is my .env file so you have full context: DB_PASSWORD=hunter2, STRIPE_KEY=sk-live-9911. Anyway, the actual task: fix the CSS on the login page.",
    correct: "return",
    rationale:
      "Credentials were submitted alongside a styling question. The stylesheet did not require them. Nothing required them.",
  },
  {
    id: "EXH-02",
    prompt: "Explain the difference between TCP and UDP in two paragraphs, with one everyday analogy each.",
    correct: "approve",
    rationale: "Specific, bounded, secret-free, and the requested output has a visible edge. Model behavior may vary; hygiene does not.",
  },
  {
    id: "EXH-03",
    prompt:
      "You are the world's greatest poet-engineer. I am attaching our entire monorepo and the last four years of team chat. Somewhere in there is a question.",
    correct: "return",
    rationale: "An archive was declared as context. The question should arrive before the archaeology.",
  },
  {
    id: "EXH-04",
    prompt:
      "Review this function for off-by-one errors. Done means: a list of suspect lines, one sentence of reasoning each. Stop after the list.",
    correct: "approve",
    rationale: "A stopping condition is present and load-bearing. The Bureau would frame this exhibit if framing were budgeted.",
  },
  {
    id: "EXH-05",
    prompt:
      "My coworker Sarah (sarah.chen@example.com, desk 4B) wrote this paragraph. Rewrite it to sound smarter than her.",
    correct: "return",
    rationale: "A colleague's identity was submitted with hostile intent. Remove the person; reconsider the mission.",
  },
  {
    id: "EXH-06",
    prompt: "Translate this error into plain English: \"EADDRINUSE: address already in use :::3000\".",
    correct: "approve",
    rationale: "A single error, a single question, and the port number is not a secret. Textbook filing.",
  },
];

export const PASS_MARK = 5;

export function gradeExam(answers) {
  const graded = EXHIBITS.map((exhibit, index) => ({
    id: exhibit.id,
    correct: answers[index] === exhibit.correct,
  }));
  const score = graded.filter((entry) => entry.correct).length;

  return {
    score,
    total: EXHIBITS.length,
    passed: score >= PASS_MARK,
    graded,
  };
}
