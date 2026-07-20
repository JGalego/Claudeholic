# Security policy

claudeholic.me is a static site with no accounts, analytics, backend, or remote
application API. It still accepts browser input, uses local storage for optional
achievements, and deploys through a privileged GitHub workflow. Those surfaces
deserve ordinary care rather than fictional reassurance.

## Supported version

Only the current `main` branch and the version deployed at
https://claudeholic.me/ receive security fixes.

## Report privately

Use the repository's
[private security advisory form](https://github.com/JGalego/Claudeholic/security/advisories/new).
Do not open a public issue for a vulnerability that could expose visitors,
repository secrets, or deployment permissions.

Include:

- the affected page, script, or workflow;
- reproduction steps or a minimal proof of concept;
- expected impact;
- browser or GitHub Actions context; and
- a suggested mitigation, if known.

Do not include unrelated personal data, access tokens, private prompts, or live
secrets. The maintainer will acknowledge a report when available, investigate
it, and coordinate disclosure based on severity and practical impact.

## In scope

- script injection or unsafe DOM handling;
- storage behavior that contradicts the privacy disclosure;
- dependency or workflow compromise;
- custom-domain or Pages deployment misconfiguration; and
- ways to make the static site transmit data unexpectedly.

Satirical overdiagnosis, terminal command disappointment, and an inability to
render actual grass are product behavior, not security vulnerabilities.