# Wallet-confirmed transactions

Every tool in this file requires `transactions:request` and returns a short-lived HTTPS confirmation page. Use the runtime schema as canonical. A successful tool call proves preparation only; the named read-back proves the product or indexed result.

## Contents

- Required sequence and response
- Tool methods

## Required sequence and response

Read the fresh state named by the tool, resolve all user-controlled choices, then prepare the request. Require `status: requires_user_confirmation`, an HTTPS `confirmationUrl`, `expiresAt`, and the backend summary/amount when returned. Give the exact link and wait for the user before read-back.

Before confirmation, return a short `Transaction ready` message with action, target, backend amount when present, labeled exact confirmation link, and expiry. After confirmation, replace it with the verified product state and its useful link or identifier. Never reuse the MCP request `operationId` as a product operation id.

```text
Transaction ready

Action: <plain-language action>
Target: <domain, site, Bag, collection, or item>
Amount: <backend amount, when returned>
Confirm: [Review and confirm](<exact confirmationUrl>)
Expires: <expiresAt>
```

### `sites.send_link_tx`

- **Permission:** `transactions:request`.
- **Input:** exact published `site`.
- **Use:** Link an already published site to its owned TON DNS target.
- **Method:** Confirm the site exists with `sites.list`; inspect current link/record state with `sites.list` or `domains.records`; then prepare the request.
- **Verify:** After user confirmation, call `domains.records` or `sites.list` and require the expected record plus `linkedHere: true` or `live`.
- **Report:** Before confirmation show site, backend amount when returned, expiry, and exact link. After read-back include the verified gateway/TON Site link.

### `payments.send_tx`

- **Permission:** `transactions:request`.
- **Input:** exact blocked product `action`: `deploy`, `publish`, or `media`.
- **Use:** Pay only after the corresponding product tool returns `payment_required`.
- **Method:** Map the blocked action exactly, prepare the request, and wait for confirmation.
- **Verify:** Retry the original product tool after confirmation. Its successful result and normal read-back are the usable payment verification.
- **Report:** Before confirmation say which product action requires payment, amount when returned, expiry, and link. Report the product action as complete only after retry succeeds.

### `dns.send_record_tx`

- **Permission:** `transactions:request`.
- **Input:** `domain`, exact `kind`, optional `valueKind`, optional `value`, and `rawCategory`/`keyName` only for custom records.
- **Use:** Set or clear a wallet, site, storage, resolver, text, ADNL, or custom DNS record.
- **Method:** Read `domains.records`; use `value: null` to clear; omit fields unrelated to the chosen kind; prepare the request.
- **Verify:** After confirmation, call `domains.records` and compare the exact category and value, including cleared state.
- **Report:** Before confirmation show action, domain, backend amount, expiry, and link. Afterward state the exact verified record.

### `dns.send_name_tx`

- **Permission:** `transactions:request`.
- **Input:** `domain` and `action`: `mint`, `bid`, or `release`.
- **Use:** Mint an available `.ton` name, bid in its auction, or release an eligible expired name.
- **Method:** Call `dns.lookup`; use `mint` only for `available`, `bid` only for `auction`, and `release` only for a releasable `expired` name. Surface the backend amount before confirmation.
- **Verify:** After confirmation, call `dns.lookup` and report the new lifecycle state. Never infer ownership from request creation.
- **Report:** Show action, name, backend amount, expiry, and link; afterward report only the lifecycle/ownership state the lookup proves.

### `dns.send_renew_tx`

- **Permission:** `transactions:request`.
- **Input:** `domains[]` containing one to four unique owned names.
- **Use:** Renew up to four owned `.ton` names in one wallet confirmation.
- **Method:** Select renewable names from `domains.list`, reject duplicates, preserve exact names, and prepare the request.
- **Verify:** After confirmation, re-read with `domains.list` or `dns.lookup` and compare expiry for every requested name.
- **Report:** Before confirmation list names, backend amount, expiry, and link. Afterward report only names whose renewed expiry is visible.

### `subdomains.create_collection_tx`

- **Permission:** `transactions:request`.
- **Input:** exact `parentAddress`, `mode` (`locked` or `linked`), 11-entry `priceGrid` of nanoTON digit strings, and `minChars` from 1 to 4.
- **Use:** Create a Subdomain collection for an owned parent.
- **Method:** Resolve the exact parent; have the user supply or explicitly approve pricing and minimum length; never invent pricing.
- **Verify:** After confirmation, find the collection with `subdomains.list_collections`, then read it with `subdomains.get_collection` or `subdomains.control`.
- **Report:** Before confirmation show parent, mode, pricing summary, backend amount, expiry, and link. Afterward give verified collection address and state.

### `subdomains.mint_tx`

- **Permission:** `transactions:request`.
- **Input:** exact `collectionAddress`, `parent`, requested `label`, and optional `setWalletToMinter`.
- **Use:** Mint or complete a pending mint for one label in a collection.
- **Method:** Read `subdomains.get_collection`; preserve exact parent/collection; enable wallet-to-minter only when explicitly desired; surface whether summary says `mint` or `confirm_mint`.
- **Verify:** After confirmation, use `subdomains.list_items` and `subdomains.get_item` to require the new owned item.
- **Report:** Before confirmation show full name, action, backend amount, expiry, and link. Afterward show verified item address and owner state.

### `subdomains.collection_action_tx`

- **Permission:** `transactions:request`.
- **Input:** `collectionAddress`, exact `action`, and only its required action-specific fields.
- **Use:** Request `withdraw_fees`, `set_access`, `set_allowlist`, `set_label_reserved`, `transfer_admin`, `link_resolver`, `unlink_resolver`, `enforce_resolver`, `fill_parent`, `claim`, `claim_revenue`, `convert_locked`, or `retry_parent_return`.
- **Method:** Read `subdomains.control` and `subdomains.get_collection`; provide `accessMode` for `set_access`, `wallet` plus `allowed` for `set_allowlist`, `label` plus `reserved` for `set_label_reserved`, or `newAdmin` for `transfer_admin`; omit unrelated fields.
- **Verify:** After confirmation, re-read collection and control state and require the intended effect.
- **Report:** Before confirmation name exact action, collection, effect, backend amount, expiry, and link. Afterward report only verified state.

### `subdomains.transfer_item_tx`

- **Permission:** `transactions:request`.
- **Input:** exact `itemAddress` and exact `newOwner`.
- **Use:** Transfer an owned Subdomain NFT item.
- **Method:** Read `subdomains.get_item`, show full name and destination for confirmation, then prepare the request.
- **Verify:** After confirmation, re-read `subdomains.list_items`; disappearance from the current wallet is expected once indexed. Use an available item read when recipient ownership must be proven.
- **Report:** Before confirmation show full name, shortened destination, backend amount, expiry, and link. Afterward say it left the current wallet only when read-back proves it.

### `subdomains.recovery_tx`

- **Permission:** `transactions:request`.
- **Input:** exact `parentAddress`, `mode` (`locked` or `linked`), and `action`.
- **Use:** Retry collection deployment or repair resolver state for an owned parent.
- **Method:** Use `retry_deployment`; use `link_resolver` only for `linked`; use `enforce_resolver` only for `locked`. Resolve the current parent/mode first.
- **Verify:** After confirmation, locate the collection and read `subdomains.get_collection` plus `subdomains.control`.
- **Report:** Before confirmation show parent, mode, recovery action, backend amount, expiry, and link. Afterward state verified deployment/resolver state.

### `storage.send_bag_link_tx`

- **Permission:** `transactions:request`.
- **Input:** exact owned `bagId` and owned `domain`.
- **Use:** Link a Bag as the TON Storage site record of an owned domain.
- **Method:** Read `storage.bag_details` and `domains.records`, resolve exact Bag/domain, then prepare the request.
- **Verify:** After confirmation, call `domains.records` and require the expected Storage-backed site record.
- **Report:** Before confirmation show BagID, domain, backend amount, expiry, and link. Afterward give verified TON Site link and record state.

### `storage.send_provider_tx`

- **Permission:** `transactions:request`.
- **Input:** `action`, `bagId`, and action-specific `quoteId`, `targetCoverageSeconds`, `providerPubkey`, or `acknowledgeOtherProviders`.
- **Use:** Request paid-provider `pin`, `top_up`, `stop`, or `withdraw` after live backend revalidation.
- **Method:** For `pin`, use the exact current `quoteId`; for `top_up`, provide accepted target coverage; for one-provider `stop`, provide its exact key; use `withdraw` only when eligible; set `acknowledgeOtherProviders` only after the user reviews that warning.
- **Verify:** After confirmation, read `storage.bag_details`. Call `storage.provider_operation` only when a distinct provider-operation UUID is available; never use the MCP request `operationId`.
- **Report:** Before confirmation show action, full BagID, backend amount, affected providers, expiry, and link. Never say paid storage is active until read-back proves it.
