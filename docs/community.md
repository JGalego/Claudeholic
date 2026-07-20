# Community Intake and Publication

Participation is repository-native and deliberately constrained. The website
does not host a submission form or collect analytics. Intake occurs through
public GitHub issues linked to submitters' accounts; the later static ledger
omits contributor identities. Never place health stories or personal data in an
issue.

## Available routes

- **Symptom candidate:** one recognizable AI-use habit, its place in the comic
  escalation, and a useful counterpart.
- **Public field-note candidate:** one generalized tool-use pattern and
  practical lesson. The intake issue is public and account-linked; only an
  accepted ledger record omits identity.
- **Translation proposal:** a scoped translation maintained and reviewed by a
  fluent human.
- **Incident report:** reproducible site defects without secrets or private
  prompt content.
- **Private security advisory:** vulnerabilities or sensitive exploit details.

Generic feature proposals remain available for changes that do not fit these
routes.

## Review boundaries

Maintainers reject submissions containing:

- medical, mental-health, addiction, disability, or personal-distress stories;
- names, employer details, private conversations, or identifying information;
- credentials, private prompts, confidential output, or security evidence;
- jokes aimed at another person or group;
- promotional claims or vendor fandom presented as guidance; or
- machine-only translations without a fluent human reviewer.

Maintainers close submissions that cross these boundaries and may request that
repository administrators remove sensitive content. Do not rely on later
redaction: issue bodies, edit history, accounts, and attachments are public.

Accepted wording may be edited for privacy, tone, length, and clarity. Original
prose and translations are published under CC BY 4.0.

## Static field-note ledger

Approved observations live in `data/field-notes.json` and render as semantic
HTML in `field-notes/index.html`. The JSON record contains only:

```json
{
  "id": "DPH-FN-000",
  "category": "verification",
  "observation": "One generalized, non-personal behavior.",
  "counterpart": "One useful practice.",
  "origin": "community-anonymous"
}
```

Do not add contributor usernames, locations, employers, demographic fields, or
submission narratives. The public record is the observation, not the observer.

Run `npm test` after changing the ledger. Validation requires every JSON record
ID and its exact observation/counterpart text to appear in the static page.