# Domains and Subdomains

Use the runtime schema as canonical. Load `transactions.md` for every transaction-producing mutation.

## Workflow and state rules

Use `dns.lookup` for public lifecycle state, `domains.list` only for wallet-wide discovery or selection, and `domains.records` for exact record/link state. When the user supplies a domain, call the exact read directly. After wallet confirmation, repeat the matching read and report only the visible change.

For Subdomains, page the list tools with the returned cursor, read the exact collection/item, and call `subdomains.control` immediately before management or recovery. Keep collection admin rights, parent rights, item ownership, and public name state separate.

Never infer availability from an empty owned list, call a published site DNS-linked without the record proof, or claim ownership from a confirmation link. Return the exact name, current/verified state, expiry when relevant, and useful address or TON Site link.

### `dns.lookup`

- **Permission:** `dns:read`.
- **Input:** normalized `.ton` `name`.
- **Use:** Read public lifecycle status, auction state, item address, expiry, and records.
- **Method:** Call before mint, bid, release, renewal, or any public-status answer.
- **Verify:** Use the returned current status; never infer availability from an empty owned-domain list.
- **Report:** Give the exact name, status, expiry/auction fact, and only records relevant to the question.

### `domains.list`

- **Permission:** `dns:read`.
- **Input:** none.
- **Use:** List `.ton` names owned by the authenticated wallet and their actionable lifecycle state.
- **Method:** Call only when the user asks to list/select owned domains or a bulk action has no exact names. Do not call it merely to revalidate a supplied domain; transaction tools perform live ownership preflight.
- **Verify:** Treat ownership as wallet-scoped and current to the indexed result. A transaction tool still performs live preflight before mutation.
- **Report:** Give the count and relevant names, including renewal/expiry facts when useful; summarize long lists.

### `domains.records`

- **Permission:** `dns:read`.
- **Input:** exact owned `domain`.
- **Use:** Read known records and Resistance Tools link state for an owned domain.
- **Method:** Call before changing a record and after the user confirms any DNS, site-link, or Bag-link transaction.
- **Verify:** Require the exact category/value, `linkedHere`, or equivalent state. An existing record may point elsewhere.
- **Report:** State the relevant record and whether it is linked here. Do not equate publication with DNS linking.

### `subdomains.list_collections`

- **Permission:** `subdomains:read`.
- **Input:** optional `limit` from 1 to 100 and returned `cursor`.
- **Use:** List Subdomain collections controlled by the authenticated wallet.
- **Method:** Page until the exact parent or collection is found or the cursor ends.
- **Verify:** Use `subdomains.get_collection` or `subdomains.control` for fresh rights before a mutation.
- **Report:** Give the relevant parent, collection address, mode, and current state; summarize long lists.

### `subdomains.list_items`

- **Permission:** `subdomains:read`.
- **Input:** optional `limit` from 1 to 100 and returned `cursor`.
- **Use:** List Subdomain NFT items owned by the authenticated wallet.
- **Method:** Page using the exact returned cursor and select by full name or item address.
- **Verify:** Use `subdomains.get_item` before transfer. Absence from one page is not proof of non-ownership.
- **Report:** Give the relevant full name and item address; summarize long lists.

### `subdomains.get_collection`

- **Permission:** `subdomains:read`.
- **Input:** exact `collectionAddress`.
- **Use:** Read one collection and the authenticated wallet's collection or parent rights.
- **Method:** Call before minting or managing the collection.
- **Verify:** Require the returned collection and control state. `not_found` can mean the wallet lacks both admin and parent rights.
- **Report:** State parent, mode, access state, and rights relevant to the requested action.

### `subdomains.get_item`

- **Permission:** `subdomains:read`.
- **Input:** exact `itemAddress`.
- **Use:** Read one Subdomain item currently owned by the authenticated wallet.
- **Method:** Call before transfer or an ownership answer.
- **Verify:** Require the returned owner/name match. After transfer, disappearance from this wallet is expected and should be reconciled with the list.
- **Report:** State the full name, item address, and verified current owner context.

### `subdomains.control`

- **Permission:** `subdomains:read`.
- **Input:** exact `collectionAddress`.
- **Use:** Read fresh authorization, mode, and parent-return state before management or recovery.
- **Method:** Call immediately before choosing an eligible collection action.
- **Verify:** Use the returned control flags instead of cached collection discovery data.
- **Report:** State whether the wallet controls the collection or parent and name the currently available relevant action.
