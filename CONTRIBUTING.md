# Contributing to the intervention

Thank you for volunteering with the entirely fictional Department of Prompt
Health. Contributions should make the project more useful, more accessible, or
more quietly funny. Ideally all three.

## Before filing paperwork

1. Search existing issues.
2. Read the [creative brief](docs/creative-brief.md).
3. Check the [lore bible](docs/lore-bible.md) before inventing a ministry.
4. Treat the [accessibility contract](docs/accessibility.md) as a requirement,
   not an aspirational appendix.

For security-sensitive reports, do not publish secrets or personal data in an
issue. This is also the site's general advice about prompts.

## Local review

The project has no install step and no production build.

```bash
npm run serve
npm test
```

Check changes at narrow mobile, keyboard-only, reduced-motion, and wide desktop
settings. Core content must remain useful when JavaScript is disabled.

## What belongs here

Good contributions include:

- accessibility and performance improvements;
- concise, self-aware copy that preserves the gentle tone;
- practical AI-literacy guidance with a clear factual basis;
- progressive enhancements that fail quietly;
- fixes for static hosting, metadata, and browser compatibility; and
- easter eggs that reward curiosity without obscuring essential content.

Please avoid:

- generic AI gradients, decorative dependency stacks, or framework migrations;
- jokes aimed at people experiencing real addiction or mental-health distress;
- official-looking Anthropic branding or implied endorsement;
- tracking, surprise network calls, or undisclosed persistence;
- inaccessible hidden content or keyboard traps; and
- memes whose half-life is shorter than the review cycle.

## Commit messages

The history is part of the work. Use Conventional Commit structure, then let the
subject carry a small second meaning.

Good:

```text
fix: reduced emotional dependency by 12%
perf: put procrastination on a static budget
docs: disclosed the undocumented coping strategy
```

Less useful:

```text
updates
stuff
final final 2
```

Funny is optional. Meaningful is not.

## Pull requests

Keep each pull request narrow. Explain the user-facing result, the reasoning,
and how you validated it. Include screenshots for visual changes and describe
keyboard or screen-reader behavior for interaction changes.

By contributing, you agree that code is licensed under MIT and original prose
or artwork under CC BY 4.0, matching the repository's existing licenses.