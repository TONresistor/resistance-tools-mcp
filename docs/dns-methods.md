# TON DNS methods

Read live DNS state before preparing a change. Transaction tools create a short-lived confirmation page; the wallet remains the only signer.

### `dns.lookup`

- **Use:** Read public status, auction state, item address, expiry, and records for one `.ton` name.
- **Method:** Normalize the exact name and call before mint, bid, release, renewal, or a public-status answer.
- **Verify:** Use the returned current status; do not infer availability from an empty local list.
- **Report:** Give the name, status, expiry/auction fact, and only the records relevant to the question.

### `domains.list`

- **Use:** List `.ton` names owned by the authenticated wallet and their actionable lifecycle state.
- **Method:** Call before selecting a domain for records, renewal, or linking.
- **Verify:** Ownership is wallet-scoped and current to the indexed result; use a transaction tool's live preflight before mutation.
- **Report:** Summarize count and relevant names, with renewal or status facts when present.

### `domains.records`

- **Use:** Read all known records and platform-link state for one owned domain.
- **Method:** Call before changing a record and after the user confirms a DNS transaction.
- **Verify:** Require the expected record value, `linkedHere`, or equivalent returned state; an existing record may point elsewhere.
- **Report:** State the exact record and whether it is linked here. Do not call publication and DNS linking the same event.

### `dns.send_record_tx`

- **Use:** Set or clear a wallet, site, storage, resolver, text, ADNL, or custom DNS record.
- **Method:** Read `domains.records`; use the exact `kind`; use `value: null` to clear; provide `rawCategory` / `keyName` only for a custom record and `valueKind` only when its value encoding differs.
- **Verify:** Return the confirmation URL first. After confirmation, call `domains.records` and compare the exact category/value.
- **Report:** Before confirmation say `DNS change ready` with action, domain, amount, expiry, and link; afterward state the verified record.

### `dns.send_name_tx`

- **Use:** Request a `.ton` mint, auction bid, or expired-name release.
- **Method:** Call `dns.lookup`; use `mint` only for `available`, `bid` only for `auction`, and `release` only for a releasable `expired` name. Surface the backend amount before confirmation.
- **Verify:** Return the confirmation URL first, then call `dns.lookup` after confirmation and report the new lifecycle state.
- **Report:** State the exact action, name, amount returned by the backend, expiry, and confirmation link; never claim ownership before lookup proves it.

### `dns.send_renew_tx`

- **Use:** Renew one to four unique owned `.ton` names in one TON Connect request.
- **Method:** Select renewable names from `domains.list`, reject duplicates, and keep each request within four domains.
- **Verify:** Return the confirmation URL first, then re-read the names with `domains.list` or `dns.lookup` and compare expiry.
- **Report:** List the names and confirmation link before signing; afterward report only renewals whose new expiry is visible.

## Shared transaction response

Always preserve `confirmationUrl` exactly. Include `summary`, `expiresAt`, and the backend-owned amount when present. A created link proves preparation only; a later DNS read proves the result.
