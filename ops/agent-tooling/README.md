# Agent Tooling

This directory holds operations-specific agent assets for Larinova.

## Structure

- `skills/` — canonical local skills that are useful for Larinova ops work, fundraising, investor materials, and writing.
- `skills-lock.json` — source/hash inventory for the skills in this directory.
- `provider-exports/` — optional generated exports for individual agent clients. Keep this ignored unless a specific provider needs checked-in config.

Do not scatter `.claude`, `.agents`, `.qwen`, `.roo`, `.windsurf`, or similar provider folders directly under `ops/`. If a provider-specific export is needed, put it under `provider-exports/<provider>/`.
