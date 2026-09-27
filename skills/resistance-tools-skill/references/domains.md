# DNS names and Subdomains

## Select a read the caller can use

| Target | Available evidence |
|---|---|
| Root `.ton` | `dns.lookup` for public lifecycle/owner; `domains.records` for owned records |
| Root `username.t.me` | `domains.list_usernames` for owned discovery; `domains.records` for an exact owned root |
| Owned child NFT | `subdomains.get_item` by item address; `subdomains.list_items` if the address must be discovered |
| Controlled collection | `subdomains.get_collection` and `subdomains.control` |
| Someone else's public collection | No public collection reader. `subdomains.mint_tx` performs its own availability/access preflight when collection, parent and label are supplied |

Keep full names and namespaces: `alice.t.me` is not `alice.t.me.ton`. Domain allowlists match exact names, not parent wildcards. Owned lists are filtered by delegation; absence can also mean a name is outside that delegation.

`domains.records` does not read child NFTs. For child record edits, use the owned item's `records` and the category/type returned there. A site-category value may be ADNL or a Storage BagID; preserve its `valueKind` when editing. Load [transactions.md](transactions.md) for writes.

### `dns.lookup`

**Permission:** `dns:read`.

Input: one root `.ton` name. Read public availability, auction/lifecycle, owner and records. Use before choosing `mint`, `bid` or `release`, and to verify root `.ton` transfer or renewal. It is not a public `.t.me` or child-name resolver. Report the exact state returned; an empty owned list is not availability evidence.

### `domains.list`

**Permission:** `dns:read`.

List owned root `.ton` names when discovery or a bulk operation is requested. Results are under `domains` and filtered by the domain allowlist. Preserve expiry/releasable facts; an individual supplied name normally needs an exact read rather than a wallet-wide list.

### `domains.list_usernames`

**Permission:** `dns:read`.

List owned Telegram Usernames under `domains`, preserving `.t.me`. This is discovery, not a public username lookup. After transferring a Username, disappearance proves at most that this wallet's visible inventory changed; it does not identify the recipient.

### `domains.records`

**Permission:** `dns:read`.

Input: one owned root `.ton` or `.t.me` `domain`. Read the exact DNS categories, value types and values before editing or linking. Verify the requested category/value after confirmation. The returned `linkedHere` is an ADNL-platform convenience flag: for a Storage-backed site, compare the `site` record's Storage type and exact BagID instead. Do not use this tool for child NFTs or after ownership has moved to another wallet.

### `subdomains.list_collections`

**Permission:** `subdomains:read`.

Discover collections administered by this wallet, with optional `limit` and returned `cursor`. Stop when the requested collection is found; only enumerate all pages for a complete-list request. A parent owner can have rights on a collection absent from this admin list; use an exact `subdomains.control` read when its address is known.

### `subdomains.list_items`

**Permission:** `subdomains:read`.

Page owned NFT items with the returned cursor; match the exact full name or item address. An item absent from one page is not proof of non-ownership. Use this read to discover a newly minted item's address, then inspect it directly. Delegation filtering can shorten a page without ending pagination.

### `subdomains.get_collection`

**Permission:** `subdomains:read`.

Input: exact `collectionAddress`. Returns `{collection, control}` only when the caller is the collection admin or owns its parent. Use for management or known owner/admin inspection. Do not make this restricted read a prerequisite for a public user's mint. `not_found` may be the rights check, even when minting is allowed.

### `subdomains.get_item`

**Permission:** `subdomains:read`.

Input: exact `itemAddress`. Returns an item owned by the authorized wallet, including its name, owner and records. Use before child-record changes and item transfers. After transfer this owner-scoped read may return `not_found`; that alone does not prove delivery to the intended recipient.

### `subdomains.control`

**Permission:** `subdomains:read`.

Input: exact `collectionAddress`. Read fresh control flags, parent rights and recovery state; flags, not a cached admin label, determine eligible management actions. This is not a public collection catalog or a source of mint pricing. Report only the rights and next action relevant to the request.
