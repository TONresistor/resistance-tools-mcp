---
name: storage
description: Create, import, inspect, fund, link, or delete TON Storage Bags with Resistance Tools. Use for Bag files and state, provider discovery, funding sessions, exact funding previews, signed quotes, provider operations, paid-provider lifecycle, and Storage-backed TON Site records.
---

# Storage

Keep platform Bag state, DNS records, provider contract/payment state, and active provider storage separate. Never recompute backend financial values or describe a locally seeded Bag as paid storage.

## Bag workflow

1. Use `storage.list_bags` to select a Bag and `storage.bag_details` for its current state.
2. Use `storage.create_bag` for explicit files or `storage.pin_bag` to import an existing public BagID.
3. Verify creation or import with both list and detail reads.
4. For deletion, inspect detail, resolve paid-provider implications first, require exact confirmation, then verify absence from `storage.list_bags`.
5. To link a Bag to a domain, use the `transactions` skill for `storage.send_bag_link_tx`, then verify the Storage record with `domains.records`.

## Paid-provider workflow

Follow this sequence without skipping or reordering:

1. Read `storage.bag_details` and select exact compatible provider keys from `storage.providers`.
2. Freeze the selected providers and shared contract balance with `storage.provider_funding_session`.
3. Calculate exact integer funding with `storage.provider_funding_preview`.
4. Show the user the backend total, resulting coverage, providers, and warnings. Continue only after the user accepts them.
5. Create the short-lived signed quote with `storage.provider_quote` using the exact accepted preview inputs.
6. Use the `transactions` skill for `storage.send_provider_tx` with the exact live `quoteId` for a pin.
7. After wallet confirmation, re-read `storage.bag_details`. Use `storage.provider_operation` only with a distinct provider-operation UUID returned separately from the confirmation request.

Read [references/tools.md](references/tools.md) before calling a Storage tool. It defines exact inputs, expiry rules, provider actions, and verification boundaries.

## Financial and state rules

- Use backend-returned nanoTON amounts and coverage exactly; never use floating point or a catalog daily-rate shortcut.
- Catalog price, uptime, capacity, country, and version are advisory. A live session, preview, and quote own the transaction values.
- A funding session expires after five minutes and a quote after two minutes. Recreate stale state from the beginning.
- The `operationId` returned by a transaction request identifies the MCP confirmation request. Never pass it to `storage.provider_operation`.
- Say paid storage is active only when a post-confirmation read proves the required provider/storage state.

## Required user response

For a Bag, include its name when present, full BagID, file count/size, and verified seed or provider state. For a provider preview or quote, include exact amount, coverage, selected providers, warnings, and expiry. For creation/import, explicitly state that paid-provider storage is separate.
