---
name: resistance-tools-mcp
description: Operate the Resistance Tools remote MCP correctly end to end for TON Sites, releases, TON DNS, transaction confirmation links, Subdomains, TON Storage, paid providers, media, payments, access and audit. Use whenever an agent must choose or sequence Resistance Tools tools, validate a result, recover from an MCP error, or give the user a short accurate completion message with the useful links and exact state boundary.
---

# Resistance Tools MCP

Use the hosted Streamable HTTP MCP. Treat its current tool schema and structured results as canonical.

## Connect

```bash
codex mcp add resistance-tools
codex mcp login resistance-tools
```

If the MCP is already added, run only `codex mcp login resistance-tools`. Let the user select permissions on the approval page; never choose or request permissions on their behalf. Never request a seed phrase, private key, proof, signature, or bearer token.

## Method

1. Read the relevant guide below before calling that tool family.
2. Identify the exact owner context and target. Use `wallet.me` when identity or delegation matters.
3. Read the narrow current state before a mutation.
4. Call the exact tool with the runtime schema. Never invent retired tools or fields.
5. Read back the authoritative state after a mutation when the guide names a verification tool.
6. Report only what the result and read-back prove.

For insufficient access, tell the user to run `codex mcp login resistance-tools` and select permissions on the approval page. Do not run `mcp add` again.

## Transaction boundary

Every transaction tool returns `status: requires_user_confirmation` and an HTTPS `confirmationUrl`. Give that URL to the user verbatim. The returned `operationId` identifies the MCP confirmation request; do not reuse it as a product-specific operation id. The tool prepared a request; it did not sign, broadcast, or confirm a transaction. After the user confirms, use the guide's read tool to verify the resulting state. Treat an expired link as unusable and create a fresh request.

## User response

- Reply in the user's language.
- Keep the normal result to a title plus two to five useful lines.
- Include the target, verified status, useful link, and release or operation identifier when available.
- Use a labeled Markdown link instead of dumping a raw URL, except when exact URL preservation is important.
- Never dump raw JSON, logs, payloads, BoCs, token hashes, or full wallet addresses unless requested.
- Distinguish `prepared`, `awaiting confirmation`, `submitted`, `confirmed`, `published`, and `live`.
- If verification is unavailable, state that boundary in one sentence.

Use [docs/response-style.md](docs/response-style.md) for the exact short response patterns.

## Tool guides

- Authentication, identity, access, audit, and resources: [docs/core-methods.md](docs/core-methods.md)
- Sites, releases, deployments, media, and product payments: [docs/sites-methods.md](docs/sites-methods.md)
- TON DNS reads and transaction requests: [docs/dns-methods.md](docs/dns-methods.md)
- Subdomain collections and items: [docs/subdomains-methods.md](docs/subdomains-methods.md)
- Free and paid TON Storage: [docs/storage-methods.md](docs/storage-methods.md)
- Exact inputs and scopes for all 46 tools: [docs/tools.md](docs/tools.md)
- Template fields: [docs/templates.md](docs/templates.md)
- OAuth and permission behavior: [docs/auth.md](docs/auth.md)

Read only the guide needed for the current task. Read multiple guides only for a cross-product workflow such as publish then link DNS, or create a Bag then attach a paid provider.
