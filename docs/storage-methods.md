# TON Storage methods

Creating or importing a Bag manages this platform's seed/reference state; it does not buy paid provider storage. For paid storage, use the complete session, preview, quote, confirmation, and operation flow below. Never recompute financial values returned by the backend.

## Paid provider flow

1. Read `storage.bag_details` and choose compatible providers with `storage.providers`.
2. Freeze the selected provider and shared-balance snapshot with `storage.provider_funding_session`.
3. Calculate exact integer funding with `storage.provider_funding_preview`.
4. Create the signed short-lived quote with `storage.provider_quote`.
5. Request the transaction with `storage.send_provider_tx` using `action: pin` and the exact `quoteId`.
6. Give the confirmation URL to the user; do not claim submission or confirmation yet.
7. After the user confirms, read `storage.bag_details` to verify provider configuration and storage state. Use `storage.provider_operation` only when a distinct provider-operation id is separately available; the transaction tool's `operationId` is the MCP confirmation-request id.

### `storage.list_bags`

- **Use:** List TON Storage Bags owned or imported by the authenticated wallet.
- **Method:** Call for Bag selection and after create, import, or delete.
- **Verify:** Use `storage.bag_details` for live detail; presence here does not prove a paid provider is actively storing the Bag.
- **Report:** Give Bag name/id and relevant local or provider state; summarize long lists.

### `storage.bag_details`

- **Use:** Read metadata and live platform state for one owned Bag.
- **Method:** Call with the exact `bagId` before linking DNS, choosing providers, or deleting.
- **Verify:** Keep seed/reference state, contract/payment state, and active provider storage separate.
- **Report:** State Bag id, size/files when returned, and only the storage/provider state actually present.

### `storage.providers`

- **Use:** Discover backend-filtered providers compatible with one owned Bag.
- **Method:** Call with `bagId` and optional sort `recommended`, `cheapest`, `uptime`, or `capacity`; select exact provider public keys.
- **Verify:** Treat catalog price, uptime, country, capacity, and version as advisory; a funding session and quote provide transaction truth.
- **Report:** Compare only useful provider facts and clearly label estimates as catalog data, not a final charge.

### `storage.provider_funding_session`

- **Use:** Freeze a short-lived live snapshot for selected providers and the Bag's shared contract balance.
- **Method:** Send the exact `bagId` and one or more returned 64-character `providerPubkeys`; the snapshot lasts five minutes, so create a new session when it expires or provider choice changes.
- **Verify:** Require the session to match the Bag and selected providers; keep its returned proof-span minimum, maximum, automatic value, coverage bounds, and expiry; never reuse it for another Bag.
- **Report:** Say the funding snapshot is ready, list selected providers compactly, and include its expiry and useful coverage bounds.

### `storage.provider_funding_preview`

- **Use:** Calculate exact integer funding, liabilities, and resulting coverage from a live session.
- **Method:** Send matching `bagId` and `sessionId`; normally use its `automaticProofSpanSeconds` or a value within its returned proof-span range, plus an accepted target within its returned coverage bounds or `null` when its default supports that.
- **Verify:** Use backend-returned nanoTON amounts and coverage exactly; do not calculate with floating point or a catalog daily-rate shortcut.
- **Report:** Show exact total, resulting coverage, selected providers, and warnings such as other providers sharing the balance.

### `storage.provider_quote`

- **Use:** Create the signed short-lived quote required for a paid provider pin.
- **Method:** After the user accepts the preview, repeat its exact `bagId`, `sessionId`, `targetCoverageSeconds`, and `proofSpanSeconds`; the signed quote lasts two minutes.
- **Verify:** Require matching quote inputs and use the returned `quoteId` before expiry; create a new session/preview/quote when stale.
- **Report:** State final backend quote, coverage, expiry, and that wallet confirmation is still required.

### `storage.provider_operation`

- **Use:** Read and reconcile one paid-provider operation after a confirmation request.
- **Method:** Call with an exact, separately obtained provider-operation UUID; never pass the MCP confirmation request's `operationId`. Poll only when the user asks to wait or status is genuinely pending.
- **Verify:** Distinguish `prepared`, `submitted`, `confirmed`, `failed`, and `expired`; only `confirmed` proves the provider transaction completed.
- **Report:** Give operation action, Bag, current status, transaction reference/error when returned, and the single next action if any.

### `storage.send_bag_link_tx`

- **Use:** Link an owned Bag as the TON Storage site record of an owned domain.
- **Method:** Read `storage.bag_details` and `domains.records`, then send the exact `bagId` and `domain`.
- **Verify:** Return the confirmation URL first. After confirmation, call `domains.records` and require the expected Storage-backed site record.
- **Report:** Before confirmation show Bag, domain, amount, expiry, and link; afterward provide the verified TON Site link and record state.

### `storage.send_provider_tx`

- **Use:** Request a paid-provider `pin`, `top_up`, `stop`, or `withdraw` transaction after live backend revalidation.
- **Method:** For `pin`, use the exact current `quoteId`; for `top_up`, provide accepted `targetCoverageSeconds`; for `stop`, provide exact `providerPubkey` when selecting one provider; use `withdraw` only when eligible. Set `acknowledgeOtherProviders` only after the user reviews that warning.
- **Verify:** Return the confirmation URL first. After the user confirms, read `storage.bag_details`; use `storage.provider_operation` only if a distinct provider-operation id is available, never the returned MCP request `operationId`.
- **Report:** Show exact action, Bag, backend-owned amount, affected providers, expiry, and link; never say paid storage is active from link creation alone.

### `storage.create_bag`

- **Use:** Create and seed a new Bag from explicit files.
- **Method:** Send at least one file with optional Bag `name`; each file needs `name` or `path` and exactly one of `text` or raw `contentBase64`.
- **Verify:** Re-read `storage.list_bags` and `storage.bag_details`; require the returned Bag id and expected file metadata.
- **Report:** Say the Bag is created/seeded, show its id and size/file count, and state that paid provider storage is separate.

### `storage.pin_bag`

- **Use:** Import and locally pin an existing public Bag by id.
- **Method:** Send the exact `bagId` and optional display `name`; do not describe this as hiring a paid provider.
- **Verify:** Re-read `storage.list_bags` and `storage.bag_details` for the imported Bag.
- **Report:** Say the Bag was imported/pinned by the platform, show its id, and keep paid-provider state separate.

### `storage.delete_bag`

- **Use:** Delete an owned Bag reference and removable platform-seeded bytes after explicit user intent.
- **Method:** Read `storage.bag_details`; handle paid providers with explicit stop/withdraw actions first when relevant; send the exact same id as `bagId` and `confirmBagId`.
- **Verify:** Re-read `storage.list_bags` and require the Bag to be absent; do not infer that on-chain providers or DNS records were removed.
- **Report:** State what platform data was deleted and explicitly identify any unchanged provider contract or DNS state.
