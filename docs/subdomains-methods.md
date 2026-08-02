# Subdomain methods

Read the fresh collection, control, or item state before every transaction request. A confirmation link proves only that the backend prepared the request; verify the indexed state after the user confirms it.

### `subdomains.list_collections`

- **Use:** List Subdomain collections controlled by the authenticated wallet.
- **Method:** Page with `limit` from 1 to 100 and the returned `cursor`; filter by the exact parent or collection relevant to the task.
- **Verify:** Treat the list as discovery, then use `subdomains.get_collection` or `subdomains.control` for fresh rights before a mutation.
- **Report:** Give the relevant parent, collection address, mode, and current state; summarize long lists.

### `subdomains.list_items`

- **Use:** List Subdomain NFT items owned by the authenticated wallet.
- **Method:** Page with `limit` from 1 to 100 and the returned `cursor`; select by exact name or item address.
- **Verify:** Use `subdomains.get_item` before transfer; an item absent from one page is not proof that it does not exist.
- **Report:** Give the relevant full name and item address; summarize long lists.

### `subdomains.get_collection`

- **Use:** Read one collection plus the authenticated wallet's current collection or parent rights.
- **Method:** Call with the exact `collectionAddress` before minting or managing the collection.
- **Verify:** Require the returned collection and control state; `not_found` can mean the wallet lacks both admin and parent rights.
- **Report:** State parent, mode, access state, and the rights relevant to the requested action.

### `subdomains.get_item`

- **Use:** Read one Subdomain item currently owned by the authenticated wallet.
- **Method:** Call with the exact `itemAddress` before transfer or an ownership answer.
- **Verify:** Require the returned owner/name match; after transfer, disappearance from this wallet is expected and should be reconciled with `subdomains.list_items`.
- **Report:** State the full name, item address, and verified current owner context.

### `subdomains.control`

- **Use:** Read fresh authorization, mode, and parent-return state before a collection management or recovery action.
- **Method:** Call with the exact `collectionAddress` immediately before choosing an eligible action.
- **Verify:** Use the returned control flags, not a cached collection list, to decide whether the wallet may act.
- **Report:** State whether the wallet controls the collection or parent and name the currently available action relevant to the request.

### `subdomains.create_collection_tx`

- **Use:** Create a `locked` or `linked` Subdomain collection for an owned parent.
- **Method:** Resolve the exact `parentAddress`; have the user supply or approve the 11 nanoTON digit strings in `priceGrid` and `minChars` from 1 to 4; never invent pricing.
- **Verify:** Return the confirmation URL first. After confirmation, find the collection with `subdomains.list_collections`, then read it with `subdomains.get_collection` or `subdomains.control`.
- **Report:** Before confirmation show parent, mode, approved pricing summary, amount, expiry, and link; afterward state the verified collection address and state.

### `subdomains.mint_tx`

- **Use:** Mint or complete a pending mint for one label in a collection.
- **Method:** Read `subdomains.get_collection`; send its exact `collectionAddress` and `parent`, the requested `label`, and `setWalletToMinter` only when explicitly desired. Surface whether the returned summary is `mint` or `confirm_mint`.
- **Verify:** Return the confirmation URL first. After confirmation, use `subdomains.list_items` and `subdomains.get_item` to require the new owned item.
- **Report:** Before confirmation show full name, action, amount, expiry, and link; afterward show the verified item address and owner state.

### `subdomains.collection_action_tx`

- **Use:** Request one current collection-management action: `withdraw_fees`, `set_access`, `set_allowlist`, `set_label_reserved`, `transfer_admin`, `link_resolver`, `unlink_resolver`, `enforce_resolver`, `fill_parent`, `claim`, `claim_revenue`, `convert_locked`, or `retry_parent_return`.
- **Method:** Read `subdomains.control` and `subdomains.get_collection`; provide `accessMode` for `set_access`, `wallet` plus `allowed` for `set_allowlist`, `label` plus `reserved` for `set_label_reserved`, or `newAdmin` for `transfer_admin`; omit unrelated fields.
- **Verify:** Return the confirmation URL first. After confirmation, re-read `subdomains.get_collection` and `subdomains.control` and require the intended state change.
- **Report:** Before confirmation name the exact action, collection, effect, amount, expiry, and link; afterward report only the state the read-back proves.

### `subdomains.transfer_item_tx`

- **Use:** Transfer an owned Subdomain NFT item to an exact new owner.
- **Method:** Read `subdomains.get_item`, confirm the full name and destination, then send the exact `itemAddress` and `newOwner`.
- **Verify:** Return the confirmation URL first. After confirmation, re-read `subdomains.list_items`; the item should no longer appear under the current wallet once indexed.
- **Report:** Before confirmation show full name, shortened destination, amount, expiry, and link; afterward say ownership left the current wallet only when read-back proves it.

### `subdomains.recovery_tx`

- **Use:** Retry collection deployment or repair resolver state for an owned parent.
- **Method:** Resolve the exact `parentAddress` and mode; use `retry_deployment`, use `link_resolver` only for `linked`, or `enforce_resolver` only for `locked`.
- **Verify:** Return the confirmation URL first. After confirmation, locate the collection and read `subdomains.get_collection` plus `subdomains.control`.
- **Report:** Before confirmation show parent, mode, recovery action, amount, expiry, and link; afterward state the verified deployment or resolver state.
