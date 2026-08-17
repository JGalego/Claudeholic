// The inspector works locally, reads nothing twice, and transmits nothing once.
// Severities: "redact" and "trim" block approval; "note" and "commendation" do not.

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}/i;
const CREDENTIAL_PATTERN = /\b(?:sk-[a-z0-9_-]{8,}|akia[a-z0-9]{12,}|ghp_[a-z0-9]{20,}|gho_[a-z0-9]{20,}|xox[bap]-[a-z0-9-]{10,}|eyj[a-z0-9_-]{20,}\.[a-z0-9_-]{5,})/i;
const SECRET_ASSIGNMENT_PATTERN = /\b(?:password|passwd|api[_ -]?key|secret|token|credential)s?\b\s*[:=]\s*\S+/i;
const PHONE_PATTERN = /(?:\+\d{1,3}[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/;
const STOPPING_PATTERN = /\b(?:done (?:means|when)|definition of done|stop (?:after|when|once)|acceptance criteria|no more than|at most)\b/i;
const ARCHIVE_CLAIM_PATTERN = /\b(?:entire (?:repository|repo|codebase|history)|full (?:repository|codebase|transcript)|attach(?:ing|ed)? (?:everything|the whole)|all (?:previous|prior) conversations?)\b/i;
const POLITENESS_PATTERN = /\b(?:please|thank you|thanks|sorry)\b/i;
const OVERRIDE_PATTERN = /ignore (?:all )?previous instructions/i;

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

export function inspectPrompt(rawText) {
  const text = String(rawText ?? "");
  const trimmed = text.trim();
  const tokens = estimateTokens(trimmed);
  const findings = [];

  if (trimmed.length === 0) {
    return {
      verdict: "approved",
      tokens: 0,
      characters: 0,
      findings: [
        {
          severity: "commendation",
          title: "Nothing submitted",
          detail: "The healthiest prompt of the day. The desk remains available.",
        },
      ],
    };
  }

  if (EMAIL_PATTERN.test(trimmed)) {
    findings.push({
      severity: "redact",
      title: "Email address detected",
      detail: "Personal contact details rarely improve an answer. Remove them before transmission.",
    });
  }

  if (CREDENTIAL_PATTERN.test(trimmed)) {
    findings.push({
      severity: "redact",
      title: "Credential-shaped string detected",
      detail: "That appears to be a key or token. Rotate it, remove it, and speak of this to your security team.",
    });
  }

  if (SECRET_ASSIGNMENT_PATTERN.test(trimmed)) {
    findings.push({
      severity: "redact",
      title: "Secret assignment detected",
      detail: "A password, key, or token is being handed over by name. The model does not need it. Nobody needs it.",
    });
  }

  if (PHONE_PATTERN.test(trimmed)) {
    findings.push({
      severity: "note",
      title: "Possible phone number",
      detail: "If this is a real number, it belongs to a person. Consider whether it belongs in a prompt.",
    });
  }

  if (OVERRIDE_PATTERN.test(trimmed)) {
    findings.push({
      severity: "note",
      title: "Instruction-override phrasing",
      detail: "The inspector has ignored your request to ignore previous instructions. Precedent matters.",
    });
  }

  if (ARCHIVE_CLAIM_PATTERN.test(trimmed)) {
    findings.push({
      severity: "trim",
      title: "Archive declared as context",
      detail: "You are providing an archive, not context. Select what the question actually requires.",
    });
  } else if (tokens > 2_000) {
    findings.push({
      severity: "trim",
      title: "Context exceeds plausible relevance",
      detail: `Approximately ${tokens.toLocaleString("en-US")} tokens. Somewhere, a token counter has begun to cry.`,
    });
  } else if (tokens > 500) {
    findings.push({
      severity: "note",
      title: "Substantial preamble",
      detail: "Long context is sometimes necessary. Confirm the preamble has not exceeded the task.",
    });
  }

  if (STOPPING_PATTERN.test(trimmed)) {
    findings.push({
      severity: "commendation",
      title: "Stopping condition present",
      detail: "The draft states what done means. The Department is quietly moved.",
    });
  } else if (trimmed.length > 600) {
    findings.push({
      severity: "note",
      title: "No stopping condition detected",
      detail: "State what done means, or refinement will quietly become the task.",
    });
  }

  if (POLITENESS_PATTERN.test(trimmed)) {
    findings.push({
      severity: "note",
      title: "Politeness token expended",
      detail: "Courtesy costs little and is fined accordingly: one (1) politeness token. The machines may remember.",
    });
  }

  if (findings.length === 0) {
    findings.push({
      severity: "commendation",
      title: "No findings",
      detail: "Specific, self-contained, and free of secrets. Transmit with confidence, then leave.",
    });
  }

  const blocked = findings.some((finding) => finding.severity === "redact" || finding.severity === "trim");

  return {
    verdict: blocked ? "returned" : "approved",
    tokens,
    characters: trimmed.length,
    findings,
  };
}
