import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
let assertionCount = 0;

function report(condition, message) {
  assertionCount += 1;

  if (!condition) {
    failures.push(message);
  }
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function listFiles(directory, predicate) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === ".git" || entry.name === "node_modules"
        ? []
        : listFiles(entryPath, predicate);
    }

    return predicate(entryPath) ? [entryPath] : [];
  });
}

function removeQueryAndHash(reference) {
  return reference.split(/[?#]/, 1)[0];
}

function localTarget(sourceFile, reference) {
  const cleanReference = decodeURIComponent(removeQueryAndHash(reference));
  return path.resolve(path.dirname(sourceFile), cleanReference || ".");
}

function assertLocalReference(sourceFile, reference, label) {
  const target = localTarget(sourceFile, reference);
  const insideRoot = target === ROOT || target.startsWith(`${ROOT}${path.sep}`);
  report(insideRoot, `${label} escapes the repository: ${reference}`);
  report(insideRoot && fs.existsSync(target), `${label} does not resolve: ${reference}`);
}

const requiredFiles = [
  ".nojekyll",
  "404.html",
  "CNAME",
  "CONTRIBUTING.md",
  "LICENSE",
  "LICENSE-CONTENT",
  "README.md",
  "SECURITY.md",
  "index.html",
  "feed.xml",
  "llms.txt",
  "llms-full.txt",
  "robots.txt",
  "sitemap.xml",
];

for (const file of requiredFiles) {
  report(fs.existsSync(path.join(ROOT, file)), `Required file is missing: ${file}`);
}

const htmlFiles = listFiles(ROOT, (file) => file.endsWith(".html"));

for (const htmlFile of htmlFiles) {
  const name = relativePath(htmlFile);
  const html = fs.readFileSync(htmlFile, "utf8");
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  report(/^<!doctype html>/i.test(html), `${name} needs an HTML doctype`);
  report(/<html\s[^>]*lang="[^"]+"/i.test(html), `${name} needs a document language`);
  report(/<title>[^<]+<\/title>/i.test(html), `${name} needs a non-empty title`);
  report(duplicateIds.length === 0, `${name} contains duplicate IDs: ${duplicateIds.join(", ")}`);

  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    report(ids.includes(match[1]), `${name} links to missing fragment #${match[1]}`);
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];

    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) {
      continue;
    }

    assertLocalReference(htmlFile, reference, `${name} reference`);
  }

  for (const match of html.matchAll(/<(?:script|img)[^>]+src="([^"]+)"/g)) {
    report(!/^https?:/i.test(match[1]), `${name} loads a remote runtime asset: ${match[1]}`);
  }

  for (const match of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = match[0];
    const relation = tag.match(/\brel="([^"]+)"/i)?.[1] ?? "";
    const reference = tag.match(/\bhref="([^"]+)"/i)?.[1] ?? "";

    if (/\b(?:stylesheet|icon|preload|modulepreload)\b/i.test(relation)) {
      report(!/^https?:/i.test(reference), `${name} loads a remote linked asset: ${reference}`);
    }
  }

  for (const match of html.matchAll(/<input\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    report(html.includes(`for="${match[1]}"`), `${name} input #${match[1]} has no explicit label`);
  }
}

const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const metadataChecks = [
  [/<meta\s+name="description"\s+content="[^"]+"/i, "meta description"],
  [/<link\s+rel="canonical"\s+href="https:\/\/claudeholic\.me\/"/i, "canonical URL"],
  [/<meta\s+property="og:image"\s+content="https:\/\/claudeholic\.me\/assets\/images\/og-preview\.png"/i, "Open Graph image"],
  [/<meta\s+name="twitter:card"\s+content="summary_large_image"/i, "Twitter card"],
  [/<script\s+type="application\/ld\+json">/i, "JSON-LD data"],
  [/<link\s+rel="alternate"\s+type="text\/plain"\s+href="\.\/llms\.txt"/i, "llms.txt discovery link"],
  [/<main\s+id="main-content">/i, "main landmark"],
  [/aria-live="polite"/i, "polite status region"],
];

for (const [pattern, label] of metadataChecks) {
  report(pattern.test(indexHtml), `index.html is missing ${label}`);
}

const jsonLdMatch = indexHtml.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);

try {
  JSON.parse(jsonLdMatch?.[1] ?? "");
  report(true, "JSON-LD is valid JSON");
} catch {
  report(false, "index.html contains invalid JSON-LD");
}

const cssFiles = listFiles(path.join(ROOT, "assets", "css"), (file) => file.endsWith(".css"));

for (const cssFile of cssFiles) {
  const name = relativePath(cssFile);
  const css = fs.readFileSync(cssFile, "utf8");
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const openingBlocks = (withoutComments.match(/{/g) ?? []).length;
  const closingBlocks = (withoutComments.match(/}/g) ?? []).length;

  report(openingBlocks === closingBlocks, `${name} has unbalanced blocks`);
  report(css.includes("prefers-reduced-motion: reduce"), `${name} needs reduced-motion handling`);

  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (!/^data:/i.test(match[1])) {
      assertLocalReference(cssFile, match[1], `${name} asset`);
    }
  }
}

const jsFiles = listFiles(path.join(ROOT, "assets", "js"), (file) => file.endsWith(".js"));

for (const jsFile of jsFiles) {
  const name = relativePath(jsFile);
  const source = fs.readFileSync(jsFile, "utf8");
  const syntaxCheck = spawnSync(process.execPath, ["--check", jsFile], { encoding: "utf8" });

  report(syntaxCheck.status === 0, `${name} does not parse: ${syntaxCheck.stderr.trim()}`);

  for (const match of source.matchAll(/(?:import[^"']*from\s*|import\s*)["'](\.[^"']+)["']/g)) {
    assertLocalReference(jsFile, match[1], `${name} import`);
  }
}

const socialPreview = fs.readFileSync(path.join(ROOT, "assets", "images", "og-preview.png"));
const pngSignature = socialPreview.subarray(0, 8).toString("hex");
report(pngSignature === "89504e470d0a1a0a", "Social preview is not a valid PNG");
report(socialPreview.readUInt32BE(16) === 1200, "Social preview must be 1200 pixels wide");
report(socialPreview.readUInt32BE(20) === 630, "Social preview must be 630 pixels high");

const cname = fs.readFileSync(path.join(ROOT, "CNAME"), "utf8").trim();
const robots = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const llms = fs.readFileSync(path.join(ROOT, "llms.txt"), "utf8");
const feed = fs.readFileSync(path.join(ROOT, "feed.xml"), "utf8");
const bulletinDirectory = path.join(ROOT, "bulletins");
const bulletinFiles = fs.readdirSync(bulletinDirectory)
  .filter((file) => file.endsWith(".html") && file !== "index.html")
  .sort();
const bulletinUrls = bulletinFiles.map((file) => `https://claudeholic.me/bulletins/${file}`);
const bulletinArchive = fs.readFileSync(path.join(bulletinDirectory, "index.html"), "utf8");
const fieldNotes = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "field-notes.json"), "utf8"));
const fieldNotesHtml = fs.readFileSync(path.join(ROOT, "field-notes", "index.html"), "utf8");
const allowedFieldNoteKeys = ["category", "counterpart", "id", "observation", "origin"];
const allowedFieldNoteCategories = new Set([
  "creative-independence",
  "human-collaboration",
  "learning",
  "privacy-and-permissions",
  "time-and-attention",
  "tool-accumulation",
  "verification",
]);

function escapeHtmlText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

report(cname === "claudeholic.me", "CNAME must contain only claudeholic.me");
report(robots.includes("Sitemap: https://claudeholic.me/sitemap.xml"), "robots.txt must advertise the canonical sitemap");
report(sitemap.includes("<loc>https://claudeholic.me/</loc>"), "sitemap.xml must contain the canonical homepage");
report(llms.startsWith("# claudeholic.me"), "llms.txt must start with the site name");
report(llms.includes("https://claudeholic.me/llms-full.txt"), "llms.txt must link to full model context");
report(feed.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"), "feed.xml must declare UTF-8 XML");
report(feed.trim().endsWith("</rss>"), "feed.xml must close its RSS document");
report(feed.includes("<rss version=\"2.0\""), "feed.xml must declare RSS 2.0");
report(feed.includes("https://claudeholic.me/bulletins/"), "feed.xml must link to the bulletin archive");
report((feed.match(/<item>/g) ?? []).length === bulletinFiles.length, "feed.xml must contain exactly one item per filed bulletin");
report(sitemap.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"), "sitemap.xml must declare UTF-8 XML");
report(sitemap.trim().endsWith("</urlset>"), "sitemap.xml must close its URL set");

for (const [index, bulletinFile] of bulletinFiles.entries()) {
  const bulletinUrl = bulletinUrls[index];
  const bulletinHtml = fs.readFileSync(path.join(bulletinDirectory, bulletinFile), "utf8");

  report(bulletinHtml.includes(`<link rel="canonical" href="${bulletinUrl}">`), `${bulletinFile} must declare its canonical URL`);
  report(bulletinHtml.includes("The Department framing is fictional") || bulletinHtml.includes("The census is satire"), `${bulletinFile} must distinguish fiction from guidance`);
  report(bulletinArchive.includes(`./${bulletinFile}`), `Bulletin archive must link to ${bulletinFile}`);
  report(indexHtml.includes(`./bulletins/${bulletinFile}`), `Homepage register must link to ${bulletinFile}`);
  report(feed.includes(`<link>${bulletinUrl}</link>`), `RSS feed must link to ${bulletinFile}`);
  report(feed.includes(`<guid isPermaLink="true">${bulletinUrl}</guid>`), `RSS feed must use ${bulletinFile} as its permalink GUID`);
  report(sitemap.includes(`<loc>${bulletinUrl}</loc>`), `Sitemap must contain ${bulletinFile}`);
}

report(fieldNotes.schemaVersion === 1, "Field-note data must use schema version 1");
report(fieldNotes.license === "CC-BY-4.0", "Field-note data must declare the content license");
report(Array.isArray(fieldNotes.notes) && fieldNotes.notes.length > 0, "Field-note data must contain approved observations");
report(sitemap.includes("<loc>https://claudeholic.me/field-notes/</loc>"), "Sitemap must contain the field-note ledger");
report(llms.includes("https://claudeholic.me/field-notes/"), "llms.txt must link to the field-note ledger");

const fieldNoteIds = new Set();
const publishedFieldNoteIds = [...fieldNotesHtml.matchAll(/data-field-note-id="([^"]+)"/g)].map((match) => match[1]);

report(publishedFieldNoteIds.length === fieldNotes.notes.length, "Field-note HTML must contain exactly one record per JSON note");

for (const note of fieldNotes.notes) {
  const noteKeys = Object.keys(note).sort();
  report(JSON.stringify(noteKeys) === JSON.stringify(allowedFieldNoteKeys), `${note.id || "Unknown field note"} must contain only the approved privacy-safe fields`);
  report(allowedFieldNoteKeys.every((key) => typeof note[key] === "string" && note[key].trim().length > 0), `${note.id || "Unknown field note"} fields must be non-empty strings`);
  report(/^DPH-FN-\d{3}$/.test(note.id), `Invalid field-note ID: ${note.id}`);
  report(!fieldNoteIds.has(note.id), `Duplicate field-note ID: ${note.id}`);
  fieldNoteIds.add(note.id);
  report(allowedFieldNoteCategories.has(note.category), `${note.id} has an invalid category`);
  report(note.origin === "department-seed" || note.origin === "community-anonymous", `${note.id} has an invalid origin`);
  report(!/[\n\r]/.test(note.observation), `${note.id} observation must be one compact record`);
  const itemPattern = new RegExp(`<li\\s+data-field-note-id="${note.id}"\\s+data-field-note-category="([^"]+)">([\\s\\S]*?)<\\/li>`);
  const itemMatch = fieldNotesHtml.match(itemPattern);
  const itemHtml = itemMatch?.[2] ?? "";
  report(Boolean(itemMatch), `Field-note page must contain a structured record for ${note.id}`);
  report(itemMatch?.[1] === note.category, `Field-note page category must match ${note.id}`);
  report(itemHtml.includes(`“${escapeHtmlText(note.observation)}”`), `Field-note page observation must safely match ${note.id}`);
  report(itemHtml.includes(escapeHtmlText(note.counterpart)), `Field-note page counterpart must safely match ${note.id}`);
}

for (const publishedId of publishedFieldNoteIds) {
  report(fieldNoteIds.has(publishedId), `Field-note HTML contains stale record ${publishedId}`);
}

if (failures.length > 0) {
  console.error(`\nStatic review failed with ${failures.length} finding(s):`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`Static review passed: ${assertionCount} checks across ${htmlFiles.length} HTML pages, ${cssFiles.length} stylesheet, and ${jsFiles.length} modules.`);