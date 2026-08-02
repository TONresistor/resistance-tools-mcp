# TON Storage

Use the runtime schema as canonical. Load `transactions.md` for every wallet-confirmed Storage mutation.

## Contents

- Paid-provider workflow
- State and response rules
- Tool methods

## Paid-provider workflow

1. Read `storage.bag_details` and select exact compatible keys from `storage.providers`.
2. Freeze providers and shared contract balance with `storage.provider_funding_session`.
3. Calculate exact integer funding with `storage.provider_funding_preview`.
4. Show amount, coverage, providers, and warnings; continue only after user acceptance.
5. Create `storage.provider_quote` with the exact accepted inputs.
6. Load `transactions.md` and request `storage.send_provider_tx` using the live quote.
7. After confirmation, re-read `storage.bag_details`; use `storage.provider_operation` only with a separately obtained provider-operation UUID.

## State and response rules

Keep platform Bag state, DNS state, provider contract/payment state, and active provider storage separate. Never recompute backend nanoTON/coverage values with floating point. Sessions last five minutes and quotes two minutes; restart the flow when stale.

For a Bag result, include name when present, full BagID, file count/size, and verified seed/provider state. For a quote, include exact amount, coverage, providers, warnings, and expiry. State that paid-provider storage is separate after create/import.

```text
TON Storage Bag ready

BagID: <bagId>
Status: <verified seed or provider state>
Files: <count>, <size>
```

### `storage.list_bags`

- **Permission:** `storage:read`.
- **Input:** none.
- **Use:** List Bags owned or imported by the authenticated wallet.
- **Method:** Call for Bag selection and after create, import, or delete.
- **Verify:** Use `storage.bag_details` for current detail. Presence in the list does not prove a paid provider actively stores the Bag.
- **Report:** Give Bag name/id and relevant platform/provider state; summarize long lists.

### `storage.bag_details`

- **Permission:** `storage:read`.
- **Input:** exact `bagId`.
- **Use:** Read metadata and current platform/provider state for one owned Bag.
- **Method:** Call before linking DNS, choosing providers, funding, or deleting.
- **Verify:** Keep seed/reference state, contract/payment state, provider configuration, and active storage separate.
- **Report:** Give full BagID, name when present, size/files, and only the provider/storage state actually returned.

### `storage.providers`

- **Permission:** `storage:read`.
- **Input:** `bagId`; optional sort `recommended`, `cheapest`, `uptime`, or `capacity`.
- **Use:** Discover backend-filtered providers compatible with one owned Bag.
- **Method:** Select exact 64-character provider public keys from the returned candidates.
- **Verify:** Treat catalog price, uptime, country, capacity, and version as advisory. A funding session and quote own transaction truth.
- **Report:** Compare only useful provider facts and label catalog values as estimates, not final charges.

### `storage.provider_funding_session`

- **Permission:** `storage:read`.
- **Input:** exact `bagId` and one or more exact `providerPubkeys[]`.
- **Use:** Freeze a short-lived provider and shared-contract-balance snapshot.
- **Method:** Create after provider selection. Retain the returned proof-span range, automatic value, coverage bounds, warnings, and expiry. Recreate if selection changes.
- **Verify:** Require the session to match the Bag and selected keys. Never reuse it for another Bag or after its five-minute expiry.
- **Report:** Say the snapshot is ready and include compact provider selection, expiry, and useful coverage bounds.

### `storage.provider_funding_preview`

- **Permission:** `storage:read`.
- **Input:** matching `bagId`, `sessionId`, `targetCoverageSeconds`, and `proofSpanSeconds`.
- **Use:** Calculate exact integer funding, liabilities, and resulting coverage from a live session.
- **Method:** Use a target inside the returned coverage bounds and normally the automatic proof span or a value inside its range.
- **Verify:** Use backend nanoTON amounts and coverage exactly. Do not calculate with floating point or a catalog daily-rate shortcut.
- **Report:** Show exact total, resulting coverage, providers, and warnings such as other providers sharing the balance.

### `storage.provider_quote`

- **Permission:** `storage:read`.
- **Input:** exact accepted `bagId`, `sessionId`, `targetCoverageSeconds`, and `proofSpanSeconds`.
- **Use:** Create the signed short-lived quote required for a paid-provider pin.
- **Method:** Call only after the user accepts the preview; repeat the exact accepted inputs and retain the returned `quoteId`.
- **Verify:** Require all returned quote inputs to match and use the quote before its two-minute expiry. Recreate stale session/preview/quote state.
- **Report:** Give final backend amount, coverage, providers, expiry, and that wallet confirmation is the next step.

### `storage.provider_operation`

- **Permission:** `storage:read`.
- **Input:** exact UUID `providerOperationId` obtained separately from the MCP confirmation request.
- **Use:** Reconcile one paid-provider operation after a confirmation request.
- **Method:** Never pass the transaction request's `operationId`. Poll only when the user asks to wait or status is genuinely pending.
- **Verify:** Distinguish `prepared`, `submitted`, `confirmed`, `failed`, and `expired`; only `confirmed` proves the provider transaction completed.
- **Report:** Give operation action, Bag, status, transaction reference/error when returned, and one next step.

### `storage.create_bag`

- **Permission:** `storage:write`.
- **Input:** optional `name`; non-empty `files[]`, each with `name` or `path` and exactly one of `text` or raw `contentBase64`.
- **Use:** Create and seed a new Bag from explicit files.
- **Method:** Preserve intended paths and content encoding; do not invent additional files.
- **Verify:** Re-read `storage.list_bags` and `storage.bag_details`; require the returned BagID and expected file metadata.
- **Report:** Say created/seeded, give full BagID and size/file count, and state that paid-provider storage is separate.

### `storage.pin_bag`

- **Permission:** `storage:write`.
- **Input:** exact public `bagId` and optional display `name`.
- **Use:** Import and locally pin an existing public Bag.
- **Method:** Use the exact BagID; do not describe this action as hiring a paid provider.
- **Verify:** Re-read `storage.list_bags` and `storage.bag_details` for the imported Bag.
- **Report:** Say imported/pinned by the platform, give full BagID, and keep paid-provider state separate.

### `storage.delete_bag`

- **Permission:** `storage:delete`.
- **Input:** `bagId` and identical `confirmBagId`.
- **Use:** Delete an owned Bag reference and removable platform-seeded bytes after explicit user intent.
- **Method:** Read details, resolve paid-provider stop/withdraw implications first, explain unchanged external state, then send matching ids.
- **Verify:** Re-read `storage.list_bags` and require the Bag to be absent. Do not infer that provider contracts or DNS records were removed.
- **Report:** State which platform data was deleted and explicitly identify unchanged provider-contract and DNS state.
