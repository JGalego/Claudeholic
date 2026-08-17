// Tallies public census-return issues into data/census.json.
// Dependency-free by departmental decree. Requires GITHUB_TOKEN and GITHUB_REPOSITORY.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = path.join(ROOT, "data", "census.json");
const STAGE_KEYS = ["0", "1", "3", "6", "9", "12"];
const TITLE_PREFIX = "[census]";

const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;

if (!repository || !token) {
  console.error("GITHUB_REPOSITORY and GITHUB_TOKEN are required. The census cannot be taken from memory.");
  process.exit(1);
}

async function fetchAllCensusIssues() {
  const issues = [];

  for (let page = 1; page <= 30; page += 1) {
    const url = `https://api.github.com/repos/${repository}/issues?state=all&labels=census-return&per_page=100&page=${page}`;
    const response = await fetch(url, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API declined the census request: ${response.status} ${response.statusText}`);
    }

    const batch = await response.json();
    issues.push(...batch);

    if (batch.length < 100) {
      break;
    }
  }

  return issues;
}

function stageFromIssue(issue) {
  const match = String(issue.body ?? "").match(/Stage (\d+)\s+—/);
  const stage = match?.[1];
  return STAGE_KEYS.includes(stage) ? stage : null;
}

const issues = await fetchAllCensusIssues();
const stages = Object.fromEntries(STAGE_KEYS.map((key) => [key, 0]));
let totalReturns = 0;
let skipped = 0;

for (const issue of issues) {
  // The issues endpoint also returns pull requests; the census does not accept code.
  if (issue.pull_request || !issue.title?.toLowerCase().startsWith(TITLE_PREFIX)) {
    continue;
  }

  const stage = stageFromIssue(issue);

  if (stage === null) {
    skipped += 1;
    continue;
  }

  stages[stage] += 1;
  totalReturns += 1;
}

const census = {
  schemaVersion: 1,
  updated: new Date().toISOString().slice(0, 10),
  source: "public GitHub issues labeled census-return, aggregate counts only",
  totalReturns,
  stages,
};

fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(census, null, 2)}\n`);
console.log(`Census tallied: ${totalReturns} return(s), ${skipped} unreadable filing(s), written to ${path.relative(ROOT, OUTPUT_PATH)}.`);
