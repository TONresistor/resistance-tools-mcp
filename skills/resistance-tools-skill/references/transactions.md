# Wallet-confirmed operations

## Shared lifecycle

All tools here require `transactions:request`. Their successful result contains `status: requires_user_confirmation`, `confirmationUrl`, `expectedSender`, `expiresAt`, `action` and a summary. Give the exact HTTPS link and meaningful summary to the user. The page restores the site's official TON Connect session; the user reviews and signs there. Do not substitute a custom QR code, `ton://` signing link or an agent-held key.

An MCP request ID is not an on-chain transaction or provider-operation ID. There is no `transactions.get`/`transactions.list` MCP tool. Once the user confirms, verify the product state below. If a response is lost, a link expires after the wallet opened, or the user is unsure whether they signed, read the resulting state before preparing anything again. If exact evidence is unavailable, report uncertainty and obtain explicit retry intent rather than silently risking a duplicate payment.

For DNS read-back, use [domains.md](domains.md): owned root records and owned child-item records are different readers. For site linkage, compare the exact category AND value type: ADNL and Storage hashes are not interchangeable.

### `sites.send_link_tx`

**Permission:** `transactions:request`.

Prepare the platform ADNL `site` record for an exact owned name. Verify the named deployment with `sites.list_releases` or a just-completed publication. Choose this tool only for ADNL hosting; if publication returned `hosting: storage` and a `bagId`, use `storage.send_bag_link_tx` instead. After confirmation, read the exact root or child record and require the intended ADNL linkage. The tool alone does not attach a new local alias; see site-domain management in [sites.md](sites.md).

### `dns.send_record_tx`

**Permission:** `transactions:request`.

Input: exact owned `domain`, `kind`, intended `value` and, when relevant, `valueKind`, `rawCategory` or `keyName`. Use `value: null` to clear. Preserve the existing value type, especially Storage under the `site` category. A new named text record needs its key name; existing custom records use their exact category. Read the root record or owned child item before editing and compare the same category/type/value afterward. Do not infer success from unrelated DNS changes.

### `dns.send_name_tx`

**Permission:** `transactions:request`.

For a root `.ton`, select `mint` only after `dns.lookup` says available, `bid` for an active auction, or `release` for an eligible expired name. The backend chooses the current amount; a release/mint request is not evidence that the name is now yours. Re-read `dns.lookup` and report the observed owner/auction/lifecycle after confirmation.

### `dns.send_renew_tx`

**Permission:** `transactions:request`.

Input: one to four unique owned `.ton` names in `domains`. Preserve explicitly supplied targets. For a larger user-requested renewal, use batches within the tool limit and give each wallet confirmation separately; do not silently add names or assume all batches succeeded. Verify each renewed expiry through `dns.lookup`.

### `dns.send_transfer_tx`

**Permission:** `transactions:request`.

Input: a root `.ton` or `.t.me` name and the recipient's exact wallet address `newOwner`. Resolve any ambiguous recipient before preparation; this input is not a DNS alias. Show the full name and recipient in the review. The backend revalidates ownership and fixes the NFT destination, transfer payload, refund address and amount.

After confirmation, `dns.lookup` can verify the intended recipient for `.ton`. The MCP has no public `.t.me` recipient-ownership read: an owned-list disappearance or `domains.records` denial is insufficient. State this boundary and use independent recipient evidence only when available within the user's request. Never retry solely because the former owner can no longer read the name.

### `subdomains.create_collection_tx`

**Permission:** `transactions:request`.

Input: known `parentAddress`, chosen `mode`, eleven nanoTON integer strings in `priceGrid` and `minChars`. Have the user choose or authorize commercial settings; do not invent prices or convert the grid through floating point. Linked and Locked have different parent-control consequences; resolve that choice before preparation. The backend derives the collection and checks parent ownership. Read the resulting administered collection/control state after confirmation; paginate discovery only if its address is not available. Do not claim a collection is connected solely because it was deployed.

### `subdomains.mint_tx`

**Permission:** `transactions:request`.

Input: supplied `collectionAddress`, full `parent`, exact `label`, optional `setWalletToMinter`. A public minter need not own or administer the collection. Do not require `subdomains.get_collection`, which can legitimately deny that user; `mint_tx` performs the fresh availability, pricing and access check itself. If the collection address or parent is missing, ask for it instead of pretending an owned collection list is a public catalog.

The runtime defaults `setWalletToMinter` to true. Set it explicitly to false when the requested result must not install that wallet record, or clarify when the choice is material. Preserve the summary's distinction between `mint` and `confirm_mint`. After confirmation, discover the exact item in `subdomains.list_items` and verify it with `subdomains.get_item`; report only the actual owned item.

### `subdomains.collection_action_tx`

**Permission:** `transactions:request`.

Read `subdomains.control`; use `get_collection` when the caller has its required rights and collection detail is needed. The schema currently exposes `withdraw_fees`, `set_access`, `set_allowlist`, `set_label_reserved`, `transfer_admin`, `link_resolver`, `unlink_resolver`, `enforce_resolver`, `fill_parent`, `claim`, `claim_revenue`, `convert_locked` and `retry_parent_return`.

Pass only the chosen action's fields: access mode; wallet plus allowed flag; label plus reserved flag; or new admin. Resolve destructive or ownership-changing effects with the user if not already authorized. After confirmation, check the specific control/collection field or balance affected. If an admin/parent transfer removes read rights, report that limitation rather than treating denial as proof of the new owner's identity.

### `subdomains.transfer_item_tx`

**Permission:** `transactions:request`.

Read the owned `itemAddress`, then prepare its transfer to exact `newOwner`. Show full name and recipient. Both item readers are owner-scoped: disappearance after signing does not establish the recipient. Use available independent evidence for a confirmed recipient claim, otherwise report submitted/ownership no longer visible. Never resend from a `not_found` read-back.

### `subdomains.recovery_tx`

**Permission:** `transactions:request`.

Input: known `parentAddress`, original `mode` and action. Use `retry_deployment` for deployment recovery, `link_resolver` only for Linked, or `enforce_resolver` only for Locked. If the collection is not deployed, its absence is not a reason to demand an impossible collection pre-read; the backend re-derives it and checks rights. If known, inspect control state to choose the recovery. Verify deployment and resolver connection separately afterward.

### `storage.send_bag_link_tx`

**Permission:** `transactions:request`.

Read the exact owned `bagId` and target root/child records, then prepare the Storage-backed `site` record. After confirmation require the `site` category with Storage value type and that exact BagID; the ADNL-only `linkedHere` flag is not sufficient. A newly attached alias also needs the local attachment operation in [sites.md](sites.md).

### `storage.send_provider_tx`

**Permission:** `transactions:request`.

For `pin`, first complete the selected-provider session/preview/quote flow in [storage.md](storage.md), then pass the matching `bagId` and fresh `quoteId`. For `top_up`, use the user's requested target remaining coverage in `targetCoverageSeconds` (30 days = 2592000 seconds), not that many additional days. No new provider session is needed. A `funding_unchanged` response means the target is already funded; do not increase it merely to create a transaction. For `stop`, select one exact managed provider key. Omitting it works only when exactly one managed provider is configured; there is no stop-all action. Only managed providers can be stopped through this tool; external providers are not removable here. If the user requests several stops, handle the selected managed keys separately with their own confirmations and read-backs. Use `withdraw` only for the requested eligible balance withdrawal. Set `acknowledgeOtherProviders` only when the user has accepted the shared-balance effect.

Read back `storage.bag_details` and its contract/provider states. Only use `storage.provider_operation` if a distinct provider-operation UUID was actually supplied; the MCP confirmation's `operationId` is not one. Configuration/payment and active storage with proof are separate results. Respect the user's spending/coverage constraints if the fresh quote or prepared amount changes.
