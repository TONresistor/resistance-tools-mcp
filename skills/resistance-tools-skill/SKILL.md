---
name: resistance-tools-skill
description: Use the Resistance Tools MCP to publish and manage TON Sites, owned DNS names and Subdomains, TON Storage, wallet-confirmed transactions, and MCP access. Use for these product operations, not general TON development or unrelated wallet administration.
---

# Resistance Tools

Operate the hosted `resistance-tools-mcp` server. Its current tool schemas and structured results are the authority for inputs and outcomes. The plugin/source is `resistance-tools-mcp@resistance-tools`; this skill is `$resistance-tools-skill`.

## Choose the reference

Load only what the request needs; combine references for an actual cross-product operation.

- [references/sites.md](references/sites.md): publication, templates, images, releases, attached domains, deletion and site links.
- [references/domains.md](references/domains.md): `.ton`, Telegram Usernames, owned Subdomain items, collection rights and exact-record reads.
- [references/storage.md](references/storage.md): free Bags, paid providers, funding choices, state verification and cleanup.
- [references/transactions.md](references/transactions.md): every `transactions:request` tool, wallet confirmation, uncertain outcomes and action-specific read-back.
- [references/wallet.md](references/wallet.md): connection problems, scopes, owner/actor context, audit, access and resources.

## Work within the request

Use the supplied name, BagID, site ID or contract address directly. List for discovery, selection, requested bulk work, or when no exact-target read exists. Do not enumerate unrelated wallet contents. `auth.status` is for authentication diagnosis; `wallet.me` is useful when identity or delegation is actually unclear.

Keep an existing authorization to perform the requested operation. Ask only for missing consequential choices or an additional effect the user has not authorized, such as deleting a source site while moving its last domain. Tool permissions do not establish user intent, and user intent does not bypass missing permissions.

Use existing project files when the user wants reusable source or edits; one-off generated content can be sent directly to a publishing tool. Do not create a disposable project merely to stage a request. Preserve unrelated site content and user files.

Follow the runtime schema rather than copying a stale argument list. Reuse exact IDs and values returned by the server. Do not invent a recipient, provider key, price grid or funding amount. A `not_found` response on an owner-scoped read can mean missing rights, not absence on-chain.

## Transactions and retries

Transaction tools prepare an HTTPS `confirmationUrl`; they do not sign or broadcast. Show that exact URL as a Markdown link, the action, target, expected recipient when relevant, backend amount and expiry. Wait for the user's wallet confirmation, then perform the read-back in the transaction reference.

The returned `operationId` is the internal MCP confirmation request ID, not a Storage provider-operation ID. Do not interchange them or invent a transaction-status tool. An expired link is unusable; if signing may already have happened, first check the resulting state before offering a fresh request. Never automatically resend an uncertain transaction or repeat a destructive mutation after a lost response.

For delayed indexing, keep the result pending. A useful default is one read-back plus up to two spaced retries over about 15 seconds, then report the last evidence. Continue longer only when the task calls for waiting; do not install monitoring implicitly.

## Report the useful result

Reply in the user's language with the exact target, verified state, useful link and relevant release/Bag/item ID. Distinguish prepared, awaiting confirmation, submitted, confirmed, published and live. A wallet acknowledgement is not execution proof; a funded provider contract is not active storage.

Do not dump JSON, base64, BoCs, credentials or audit internals. Abbreviate wallet addresses except when the recipient must be reviewed exactly. If a read-back is unavailable, state that specific boundary and the next useful action; do not substitute a successful tool call for verification.

The MCP does not currently expose Webdom trading, a public `.t.me` recipient-ownership lookup, or a public Subdomain collection browser. Explain those capability limits when they block the requested workflow. Do not work around missing tools with unrelated APIs or additional transactions without the user's scope supporting that work.
