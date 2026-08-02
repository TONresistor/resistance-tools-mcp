---
name: resistance-tools-skill
description: Operate the complete Resistance Tools MCP for TON Sites, TON DNS, Subdomains, TON Storage, wallet access, audit, permissions, paid providers, and manually confirmed transactions. Use whenever an agent must select or sequence Resistance Tools tools, validate the resulting state, recover from an MCP error, or return the correct concise links and identifiers to the user.
---

# Resistance Tools

Use the hosted `resistance-tools-mcp` MCP and treat its runtime tool schema and structured results as canonical. Complete the requested workflow, verify the resulting state, and give the user the useful outcome instead of raw tool output.

## Connection and permissions

Keep these identifiers distinct:

- Marketplace/source: `resistance-tools`
- Plugin and MCP server: `resistance-tools-mcp`
- Skill: `resistance-tools-skill`

For a fresh Codex plugin install:

```bash
codex plugin marketplace add TONresistor/resistance-tools-mcp@main
codex plugin add resistance-tools-mcp@resistance-tools
codex mcp login resistance-tools-mcp
```

For a fresh Claude Code plugin install:

```bash
claude plugin marketplace add TONresistor/resistance-tools-mcp@main
claude plugin install resistance-tools-mcp@resistance-tools
claude mcp login resistance-tools-mcp
```

For MCP-only setup:

Codex:

```bash
codex mcp add resistance-tools-mcp --url https://app.resistance.dog/api/mcp
codex mcp login resistance-tools-mcp
```

Claude Code:

```bash
claude mcp add --transport http resistance-tools-mcp https://app.resistance.dog/api/mcp
claude mcp login resistance-tools-mcp
```

If the MCP is already registered, do not add it again. Use only the client's native login flow. Let the user select permissions or use `Approve all` on the approval page; never choose permissions for them. Never request a seed phrase, private key, proof, signature, bearer token, or wallet export.

For a normal update from version 0.2.3 or later, preserve the current marketplace identity and use the matching sequence.

Codex:

```bash
codex plugin marketplace upgrade resistance-tools
codex plugin remove resistance-tools-mcp@resistance-tools
codex plugin add resistance-tools-mcp@resistance-tools
codex mcp login resistance-tools-mcp
```

Claude Code:

```bash
claude plugin marketplace update resistance-tools
claude plugin update resistance-tools-mcp@resistance-tools
```

An error that names `resistance-tools`, including `invalid_target`, proves the retired MCP alias is still configured. Do not retry login against that alias. Give the matching cleanup and reinstall sequence; if an old entry is already absent, continue.

Codex:

```bash
codex mcp logout resistance-tools
codex mcp remove resistance-tools
codex mcp logout resistance-tools-mcp
codex mcp remove resistance-tools-mcp
codex plugin remove resistance-tools@resistance-tools
codex plugin remove resistance-tools-mcp@resistance-tools
codex plugin marketplace remove resistance-tools
codex plugin marketplace add TONresistor/resistance-tools-mcp@main
codex plugin add resistance-tools-mcp@resistance-tools
codex mcp login resistance-tools-mcp
```

Claude Code:

```bash
claude mcp logout resistance-tools
claude mcp remove resistance-tools
claude mcp logout resistance-tools-mcp
claude mcp remove resistance-tools-mcp
claude plugin uninstall resistance-tools@resistance-tools
claude plugin uninstall resistance-tools-mcp@resistance-tools
claude plugin marketplace remove resistance-tools
claude plugin marketplace add TONresistor/resistance-tools-mcp@main
claude plugin install resistance-tools-mcp@resistance-tools
claude mcp login resistance-tools-mcp
```

## Method

1. Load only the bundled reference needed for the task before calling its tools.
2. Use an exact target supplied by the user directly. Do not enumerate the user's wallet, sites, domains, Bags, collections, or items merely to rediscover it.
3. Read the narrow current state before a mutation. Call a list tool only for discovery, selection, bulk work, or when no exact-target read exists.
4. Use `auth.status` only for authentication troubleshooting and `wallet.me` only when identity or delegation is requested or genuinely ambiguous.
5. Match local work to the request: preserve or edit local files when the user wants a project or reusable source; send one-off generated content directly when it exists only to be published. Never create a throwaway project as an intermediate step.
6. Call the exact tool with the runtime schema, run the narrow named read-back after mutation or wallet confirmation, and report only what those results prove.

## References

- Read [references/sites.md](references/sites.md) for publishing, releases, media, deployments, rollback, deletion, templates, gateway links, and site result formats.
- Read [references/domains.md](references/domains.md) for TON DNS reads, records, lifecycle, owned domains, Subdomain collections, items, and control state.
- Read [references/storage.md](references/storage.md) for Bags, provider discovery, funding sessions, exact previews, quotes, provider operations, imports, and deletion.
- Read [references/wallet.md](references/wallet.md) for authentication, policy, owner/actor identity, permissions, access, audit, revocation, and fixed resources.
- Read [references/transactions.md](references/transactions.md) before every tool requiring `transactions:request` or whenever a result contains `requires_user_confirmation` or `confirmationUrl`.

Load multiple references only for a real cross-product sequence, such as publishing then linking DNS, or funding Storage then requesting provider confirmation.

## Transaction boundary

Every transaction tool creates a short-lived HTTPS confirmation request. Give its exact `confirmationUrl` to the user and wait. The link means `prepared` or `awaiting confirmation`; it does not mean signed, sent, submitted, confirmed, paid, linked, minted, renewed, or active.

The returned `operationId` identifies the internal MCP confirmation request, not a product-specific operation. Do not report it or pass it to another tool. After the user confirms, run the mapped read-back. Treat an expired link as unusable and create a fresh request after a new preflight. Do not add boilerplate explaining that the agent cannot sign.

## User response

- Reply in the user's language.
- Keep the normal result to a short title and two to five useful lines.
- Include the exact target, verified status, useful link, and release, BagID, collection, item, or operation identifier when available.
- Use a labeled Markdown link and preserve exact URLs as link targets.
- Never dump raw JSON, logs, payloads, BoCs, token hashes, base64, or full wallet addresses unless requested.
- Distinguish `prepared`, `awaiting confirmation`, `submitted`, `confirmed`, `published`, and `live`.
- If verification is unavailable, state that boundary in one sentence and give one concrete next action.
