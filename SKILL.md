---
name: resistance-tools-mcp
description: Use when installing, configuring, or operating the Resistance Tools MCP for TON Sites, template media, deployments, TON DNS transaction preparation, MCP access audit, or TON Storage.
---

# Resistance Tools MCP

Use the hosted remote HTTP MCP first. Use the npm stdio bridge only when native remote OAuth is unavailable or the agent controls a wallet and can sign TON proofs.

## Setup

```bash
codex mcp add resistance-tools \
  --url https://app.resistance.dog/api/mcp \
  --oauth-resource https://app.resistance.dog/api/mcp
codex mcp login resistance-tools
```

Fallback bridge:

```bash
npm install -g @resistance-tools/mcp
```

Never request a seed phrase, private key or raw bearer token.

## Scope choice

Request only what the operation needs:

- `wallet:read`, `sites:read`, `deployments:read`, `dns:read`, `storage:read` for default reads.
- `sites:write` to publish files or templates.
- `media:write` to upload template images.
- `dns:prepare_tx` to prepare a transaction that still requires wallet approval.
- `storage:write` to create or pin bags.
- `sites:rollback`, `sites:delete`, `storage:delete` and `mcp:revoke` only for an explicitly confirmed destructive action.
- `mcp:read` to inspect consents, sessions and audit records.

## Site publishing

Supported targets are a `.ton` or `.t.me` root or one child below it. Ownership, delegation allowlists and target readiness are checked by the backend.

Use `sites.publish_files` for explicit files. Use `sites.publish_template` for one of: `links`, `blog`, `redirect`, `token`, `sale`, `tip`.

For template images, call `media.upload_image` first and place its returned `media/<sha256>.<ext>` path in the template content. Follow [docs/templates.md](docs/templates.md); do not invent template fields.

## Safety

- Exact confirmation fields must match the target for rollback, delete and consent revocation.
- DNS tools prepare TON Connect transactions; they do not broadcast or sign them.
- Read back state after a mutation when the corresponding read tool is available.
- Do not expose tokens, proofs, signatures or wallet secrets in the final response.
- If a tool name or schema is uncertain, list tools or read [docs/tools.md](docs/tools.md).
