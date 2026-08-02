---
name: domains
description: Inspect and manage TON DNS names and Subdomain collections with Resistance Tools. Use for domain ownership, lifecycle and auction status, DNS records, renewals, site or Storage records, Subdomain collection discovery, minting, item transfers, collection control, and recovery workflows.
---

# Domains

Use live Resistance Tools reads to establish ownership, lifecycle, records, and control before any domain or Subdomain conclusion. Use the `transactions` skill for every wallet-confirmed mutation.

## Domain workflow

1. Use `dns.lookup` for public status, auction state, expiry, item address, and records of one `.ton` name.
2. Use `domains.list` to select names owned by the authenticated wallet.
3. Use `domains.records` before changing or describing an owned name's records.
4. For a record, name, or renewal action, load the `transactions` skill, prepare the exact transaction request, give the confirmation link, and wait for the user.
5. After confirmation, read `domains.records`, `domains.list`, or `dns.lookup` and report only the state that changed visibly.

## Subdomain workflow

1. Discover collections or items with the paginated list tool; follow the returned cursor when the requested target is not on the first page.
2. Read the exact collection or item before acting.
3. Call `subdomains.control` immediately before collection management or recovery. Use its fresh rights and mode, not a cached list.
4. Load the `transactions` skill for collection creation, minting, management, transfer, or recovery.
5. After confirmation, use the mapped collection, item, list, and control reads to verify the indexed result.

Read [references/tools.md](references/tools.md) for the exact read-tool inputs, pagination rules, ownership boundary, and verification method.

## State rules

- Never infer availability from an empty owned-domain list; use `dns.lookup`.
- Never call a published site DNS-linked until the expected record and `linkedHere` state are visible.
- Never claim ownership immediately after creating a transaction link.
- Keep collection admin rights, parent rights, item ownership, and public name state separate.
- An item disappearing from the current wallet after transfer can be expected, but report it only after a fresh read.

## Required user response

For reads, give the exact name, current status or record, expiry when relevant, and the single actionable next step. For verified changes, give the name or collection, the verified new state, and its useful address or TON Site link. Abbreviate wallet addresses unless the full value is necessary.
