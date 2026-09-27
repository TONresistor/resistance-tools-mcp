# TON Storage

## Free Bags versus paid storage

`create_bag` and `pin_bag` create/import a platform reference and free seeding; they do not hire paid providers. A successful import can still be resolving or downloading. Report state from `bag_details.live` and `pinModes`, not from the verb used by the tool.

Paid evidence is under `paidStorage`: contract balance/configuration, the complete provider set and each provider's storage/proof state. A configured provider may still be resolving/downloading. Prefer this contract-centric object to legacy `paid`, which is a compatibility projection of one provider.

## Adding paid providers

Use Bag details → provider selection → funding session → exact preview → quote → [wallet confirmation](transactions.md). Retain the same Bag, keys, proof span and coverage choice throughout. A selected provider set can share balance with existing or external providers. Use backend integer nanoTON amounts, liabilities, first rewards and coverage; catalog daily prices are advisory.

Honor the user's authorized provider, cost and duration choices. Ask only for a missing choice or a material changed amount/effect. Do not choose new spending settings merely to get a successful quote. `targetCoverageSeconds: null` means minimum activation funding, not an unspecified desired duration. Session/quote expiries are returned; the current lifetimes are five and two minutes. Refresh stale read/quote state, but never repeat a wallet action whose outcome is uncertain.

### `storage.list_bags`

**Permission:** `storage:read`.

Discover owned/imported Bags when requested. Use an exact supplied or newly returned BagID directly with `bag_details`. Inventory membership is not proof of paid storage. Report full BagIDs when needed for reuse.

### `storage.bag_details`

**Permission:** `storage:read`.

Input: exact `bagId`. Read name/size, free/paid pin modes, live file/seed state when available, and `paidStorage` contract/provider state. `live: null` means local daemon evidence is unavailable, not that the Bag is empty. Use this before funding, DNS linking or deletion and for the corresponding read-back.

### `storage.providers`

**Permission:** `storage:read`.

Input: `bagId`, optional runtime-supported sort. Select exact provider public keys from backend-filtered candidates. Treat country, uptime, version, capacity and catalog price as advisory; do not substitute them for a live offer or disqualify an unknown software version by yourself.

### `storage.provider_funding_session`

**Permission:** `storage:read`.

Input: exact Bag and selected `providerPubkeys`. Retain the signed `sessionId`, provider snapshot, automatic proof span, valid ranges, balance warnings and expiry. Selection changes require a fresh session; a session from another Bag is never reusable.

### `storage.provider_funding_preview`

**Permission:** `storage:read`.

Input: matching Bag/session, `proofSpanSeconds` and `targetCoverageSeconds` (a positive duration or explicit null for minimum). Stay within the returned bounds, normally using the automatic proof span. Present backend funding and resulting coverage, including existing-provider liabilities and initial rewards; do not approximate `balance / daily rate` or invent a client amount.

### `storage.provider_quote`

**Permission:** `storage:read`.

Create a quote with the exact accepted session, Bag, duration/minimum choice and proof span. Retain the returned `quoteId` and expiry. If a revalidation changes cost, coverage or affected providers beyond the authorized choice, resolve that change before continuing. The quote itself neither pays nor activates storage.

### `storage.provider_operation`

**Permission:** `storage:read`.

Input: separately obtained provider-operation UUID as `providerOperationId`. Never pass the transaction request's `operationId`. Read/reconcile the named operation when available. `confirmed` proves this operation's contract effect, not necessarily active storage; also check Bag provider/proof state. If no provider ID is exposed, use Bag details and state that per-operation tracking is unavailable.

### `storage.create_bag`

**Permission:** `storage:write`.

Create from the intended files: each needs a `name` or `path` and exactly one of `text` or raw `contentBase64`; `name` for the Bag is optional. Preserve file paths and bytes. Verify the returned BagID, expected files/size and current seed state using `bag_details`. Do not claim full download/seeding completion when it is still pending.

### `storage.pin_bag`

**Permission:** `storage:write`.

Import the exact public BagID with an optional display name. Verify that Bag's platform reference and resolving/downloading/seeding state. This is free platform pinning, not a paid-provider contract.

### `storage.delete_bag`

**Permission:** `storage:delete`.

Read the Bag and delete its platform reference with identical `bagId`/`confirmBagId` after the user has authorized that deletion. Do not automatically stop providers, withdraw funds or clear DNS: those are separate effects requiring their own scope.

Read back the exact Bag. `not_found` can confirm removal when nothing owned remains; if the user's paid contract still exists, Bag details may remain while `pinModes` no longer contains `free`. Report local reference removal separately from paid contracts, other references and DNS. If only the contract is active, say the paid contract remains; do not call provider storage active without its storage/proof evidence. Backend cleanup retains shared bytes when they are still needed.
