# Department Bulletin Publishing Procedure

Bulletins are occasional static notices, not a content treadmill. Publish one
only when the practical guidance remains useful after its joke is removed.

## Required paperwork

Every bulletin must include:

- one clear problem;
- vendor-neutral practical guidance;
- an explicit line between fictional findings and factual advice;
- a publication date and stable Department file number;
- a canonical URL and useful meta description;
- a single `h1` followed by a coherent heading hierarchy;
- a link back to the archive, homepage, and RSS feed; and
- no script unless the content genuinely requires progressive enhancement.

## Publishing checklist

1. Create a semantic HTML file under `bulletins/` using an existing notice as
   the structural reference.
2. Add the notice to `bulletins/index.html` and the homepage register.
3. Add an RSS item to `feed.xml`, newest first, with an RFC 822 date and stable
   permalink GUID.
4. Add the canonical URL to `sitemap.xml`.
5. Add or update the concise entry in `llms.txt` or `llms-full.txt` when it
   changes the project's documented guidance.
6. Run `npm test` and inspect the notice at 390 px and 1440 px.
7. Check tables inside their horizontal scroll wrapper at 320 px.
8. Read the notice once without the jokes. If nothing useful remains, do not
   publish it.

## Editorial boundaries

- Do not manufacture urgency to satisfy a schedule.
- Do not present satire as survey data, medical guidance, or security research.
- Do not turn a specific vendor incident into a universal claim without sources.
- Do not collect reader health stories or sensitive free-form submissions.
- Prefer one strong notice over a weekly stream of administrative vapor.

The Department reserves the right to remain quiet.