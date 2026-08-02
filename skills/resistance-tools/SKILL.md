---
name: resistance-tools
description: Operate the complete Resistance Tools MCP for TON Sites, TON DNS, Subdomains, TON Storage, wallet access, audit, permissions, paid providers, and manually confirmed transactions. Use whenever an agent must select or sequence Resistance Tools tools, validate the resulting state, recover from an MCP error, or return the correct concise links and identifiers to the user.
---

# Resistance Tools

Use the hosted `resistance-tools` MCP and treat its runtime tool schema and structured results as canonical. Complete the requested workflow, verify the resulting state, and give the user the useful outcome instead of raw tool output.

## Connection and permissions

For Codex MCP-only setup:

```bash
codex mcp add resistance-tools --url https://app.resistance.dog/api/mcp
codex mcp login resistance-tools
```

If the MCP is already registered, do not add it again. Use only the client's native login flow. Let the user select permissions or use `Approve all` on the approval page; never choose permissions for them. Never request a seed phrase, private key, proof, signature, bearer token, or wallet export.

## Method

1. Load only the bundled reference needed for the task before calling its tools.
2. Identify the exact owner context and target. Use `wallet.me` when identity, delegation, or target access is ambiguous.
3. Read the narrow current state before a mutation.
4. Call the exact tool with the runtime schema. Never invent retired tools or fields.
5. After a mutation or wallet confirmation, run the reference's named read-back tool.
6. Report only what the tool result and read-back prove.

## References

- Read [references/sites.md](references/sites.md) for publishing, releases, media, deployments, rollback, deletion, templates, gateway links, and site result formats.
- Read [references/domains.md](references/domains.md) for TON DNS reads, records, lifecycle, owned domains, Subdomain collections, items, and control state.
- Read [references/storage.md](references/storage.md) for Bags, provider discovery, funding sessions, exact previews, quotes, provider operations, imports, and deletion.
- Read [references/wallet.md](references/wallet.md) for authentication, policy, owner/actor identity, permissions, access, audit, revocation, and fixed resources.
- Read [references/transactions.md](references/transactions.md) before every tool requiring `transactions:request` or whenever a result contains `requires_user_confirmation` or `confirmationUrl`.

Load multiple references only for a real cross-product sequence, such as publishing then linking DNS, or funding Storage then requesting provider confirmation.

## Transaction boundary

Every transaction tool creates a short-lived HTTPS confirmation request. Give its exact `confirmationUrl` to the user and wait. The link means `prepared` or `awaiting confirmation`; it does not mean signed, sent, submitted, confirmed, paid, linked, minted, renewed, or active.

The returned `operationId` identifies the MCP confirmation request, not a product-specific operation. After the user confirms, run the mapped read-back. Treat an expired link as unusable and create a fresh request after a new preflight. Do not add boilerplate explaining that the agent cannot sign.

## User response

- Reply in the user's language.
- Keep the normal result to a short title and two to five useful lines.
- Include the exact target, verified status, useful link, and release, BagID, collection, item, or operation identifier when available.
- Use a labeled Markdown link and preserve exact URLs as link targets.
- Never dump raw JSON, logs, payloads, BoCs, token hashes, base64, or full wallet addresses unless requested.
- Distinguish `prepared`, `awaiting confirmation`, `submitted`, `confirmed`, `published`, and `live`.
- If verification is unavailable, state that boundary in one sentence and give one concrete next action.
