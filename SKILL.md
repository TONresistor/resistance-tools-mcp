---
name: resistance-tools-mcp
description: Use when installing, configuring, or using the Resistance Tools MCP at https://app.resistance.dog/api/mcp, including OAuth wallet auth, publishing or updating sites, rollback/delete, DNS transaction preparation, and TON Storage bag create/pin/delete workflows.
---

# Resistance Tools MCP

Use the hosted remote HTTP MCP first. Treat the stdio bridge as a fallback for clients without remote HTTP OAuth, or for an agent that controls a wallet and can sign TON proofs itself.

## Setup

Prefer native MCP OAuth. Do not ask the user for an MCP token in the normal flow.

Codex:

```bash
codex mcp add resistance-tools \
  --url https://app.resistance.dog/api/mcp \
  --oauth-resource https://app.resistance.dog/api/mcp
codex mcp login resistance-tools
```

Claude Code:

```bash
claude mcp add --transport http resistance-tools https://app.resistance.dog/api/mcp
claude mcp login resistance-tools
```

If the client cannot do remote HTTP OAuth, use the npm stdio bridge:

```bash
npm install -g @resistance/resistance-tools-mcp
```

## Auth Choice

If auth is needed and the user has not already chosen a flow, ask whether to use:

- Browser wallet approval: user connects a wallet and approves scopes in the Resistance Tools auth page.
- Agent-controlled wallet: the agent controls a wallet and can sign the TON proof itself.

For remote HTTP clients, use the client's native OAuth login command. For stdio fallback only:

- Browser wallet: call `auth.device_start`, open `authorizationUrl`, then call `auth.device_complete` after approval.
- Agent-controlled wallet: call `auth.wallet_challenge`, sign `tonProof.payload`, then call `auth.wallet_complete`.

Never request a seed phrase, private key, or raw bearer token from the user.

## Scopes

Request the narrowest scopes needed:

- Read sites: `sites:read`
- Publish or update sites: `sites:write`
- Rollback sites: `sites:rollback`
- Delete sites: `sites:delete`
- Read deployments: `deployments:read`
- Read DNS: `dns:read`
- Prepare DNS transactions: `dns:prepare_tx`
- Read storage: `storage:read`
- Create or pin bags: `storage:write`
- Delete bags: `storage:delete`
- Read wallet/account context: `wallet:read`

For destructive actions, require the exact confirmation fields expected by the tool.

## Sites

Use `sites.publish_files` when the agent built or generated files itself. Send explicit files with safe relative paths:

```json
{
  "site": "example.ton",
  "files": [
    {
      "path": "index.html",
      "text": "<!doctype html><html><body>Hello</body></html>"
    }
  ]
}
```

Use `contentBase64` for binary assets. Do not use preview tools; the agent can inspect its own files before publishing.

Use `sites.publish_template` only when the user explicitly wants one of the server-supported templates.

After publishing, read back the site or deployment state with `sites.list`, `sites.get_content`, or `deployments.list` when available.

## Rollback And Delete

Use `sites.rollback` only with an explicit release id and exact confirmation:

```json
{
  "site": "example.ton",
  "releaseId": "20260707110000",
  "confirmSite": "example.ton"
}
```

Use `sites.delete` only when the user clearly asked to delete the site:

```json
{
  "site": "example.ton",
  "confirmSite": "example.ton"
}
```

If the target is ambiguous, stop and ask for the exact site name.

## Storage

Create a new TON Storage bag with `storage.create_bag`:

```json
{
  "name": "site-assets",
  "files": [
    {
      "name": "index.html",
      "text": "<!doctype html><html><body>Hello</body></html>"
    }
  ]
}
```

Pin an existing public bag with `storage.pin_bag`:

```json
{
  "bagId": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "name": "mirror"
}
```

Delete a bag only with exact confirmation:

```json
{
  "bagId": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "confirmBagId": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
```

## DNS

Use DNS tools to inspect domains and prepare transactions. If a tool only prepares a TON Connect transaction, do not claim it broadcasted on-chain; tell the user the transaction still needs wallet approval.

## Rules

- Prefer remote HTTP OAuth over stdio.
- Do not invent tool names. If unsure, list tools first.
- Do not expose tokens, proofs, signatures, or wallet secrets in final output.
- Use "agent-controlled wallet" or "wallet controlled by the agent"; avoid older wallet wording.
- Keep user-facing summaries short: action taken, target, resulting id/url/status, and any required next step.
