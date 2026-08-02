---
name: resistance-tools-mcp
description: Use when installing, configuring, or operating the Resistance Tools MCP for TON Sites, template media, deployments, TON DNS transaction preparation, MCP access audit, or TON Storage.
---

# Resistance Tools MCP

Use the hosted Streamable HTTP MCP with native OAuth.

## Setup

```bash
codex mcp add resistance-tools \
  --url https://app.resistance.dog/api/mcp \
  --oauth-resource https://app.resistance.dog/api/mcp
codex mcp login resistance-tools
```

```bash
claude mcp add --transport http resistance-tools https://app.resistance.dog/api/mcp
```

In Claude Code, run `/mcp`, select `resistance-tools`, and authenticate. For other clients, add the URL as a Streamable HTTP server and use native OAuth.

Let the user select permissions on the approval page. Never enumerate, recommend or request individual scopes on their behalf. If access is insufficient, report it and direct the user back to the approval page without choosing for them.

Never request a seed phrase, private key or raw bearer token.

## Tool map

- `auth.status` and `auth.policy`: inspect remote authentication and safety rules.
- `wallet.me`: confirm the effective owner, actor and client before acting.
- `sites.*`: list/read sites and releases, publish files or templates, rollback, or delete. Read before mutating; rollback and delete require exact confirmation fields.
- `deployments.list`: inspect retained deployment history across the owner's sites.
- `dns.lookup`: inspect any public `.ton` name. `domains.*` reads owned domains and records. `dns.prepare_*` only prepares an unsigned wallet transaction.
- `media.upload_image`: upload a template image, then reuse the returned `media/...` path in `sites.publish_template`.
- `storage.*`: list/details reads bags, `create_bag` seeds new files, `pin_bag` imports an existing BagID, and `delete_bag` requires exact confirmation.
- `mcp.access.*` and `mcp.audit.*`: inspect consents, sessions and redacted activity; consent revocation invalidates matching tokens and requires exact confirmation.
- `tonsite://wallet`, `tonsite://sites`, `tonsite://deployments`, `tonsite://domains` and `tonsite://bags`: read-only resource snapshots for the same owner context.

## Site publishing

Supported targets are a `.ton` or `.t.me` root or one child below it. Ownership, delegation allowlists and target readiness are checked by the backend.

Use `sites.publish_files` for explicit files. Use `sites.publish_template` for one of: `links`, `blog`, `redirect`, `token`, `sale`, `tip`.

For template images, call `media.upload_image` first and place its returned `media/<sha256>.<ext>` path in the template content. Follow [docs/templates.md](docs/templates.md); do not invent template fields.

## Safety

- Exact confirmation fields must match the target for rollback, delete and consent revocation.
- DNS tools prepare TON Connect transactions; they do not broadcast or sign them.
- Read back state after a mutation when the corresponding read tool is available.
- Do not expose tokens, proofs, signatures or wallet secrets in the final response.
- Treat the runtime MCP tool schema as canonical. If a name or input is uncertain, list tools; use [docs/tools.md](docs/tools.md) only as a compact reference.
