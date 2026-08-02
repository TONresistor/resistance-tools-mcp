# Remote tools

The hosted server exposes 46 tools. `?` means optional and `null` is distinct from omission.

## Core, access, and audit

| Tool | Permission | Input |
|---|---|---|
| `auth.status` | public | none |
| `auth.policy` | public | none |
| `wallet.me` | `wallet:read` | none |
| `mcp.access.list` | `mcp:read` | none |
| `mcp.audit.list` | `mcp:read` | `limit?` 1–100, `method?`, `resultStatus?`, `since?` |
| `mcp.audit.summary` | `mcp:read` | `windowHours?` 1–720, `topMethodsLimit?` 1–50 |
| `mcp.access.revoke_consent` | `mcp:revoke` | `consentId`, matching `confirmConsentId` |

## Sites, payments, and media

| Tool | Permission | Input |
|---|---|---|
| `sites.list` | `sites:read` | none |
| `sites.get_content` | `sites:read` | `site` |
| `sites.send_link_tx` | `transactions:request` | `site` |
| `payments.send_tx` | `transactions:request` | `action`: `deploy`, `publish`, or `media` |
| `sites.list_releases` | `sites:read` | `site` |
| `sites.publish_files` | `sites:write` | `site`, `files[]` with `path` and one of `text` / `contentBase64` |
| `sites.publish_template` | `sites:write` | `site`, `template`, `content` |
| `sites.rollback` | `sites:rollback` | `site`, `releaseId`, matching `confirmSite` |
| `sites.delete` | `sites:delete` | `site`, matching `confirmSite` |
| `deployments.list` | `deployments:read` | none |
| `media.upload_image` | `media:write` | raw `contentBase64` |

Supported site forms are `name.ton`, `child.name.ton`, `username.t.me`, and `child.username.t.me`. The authenticated owner or delegation must cover the exact target.

## TON DNS

| Tool | Permission | Input |
|---|---|---|
| `dns.lookup` | `dns:read` | `name` |
| `domains.list` | `dns:read` | none |
| `domains.records` | `dns:read` | `domain` |
| `dns.send_record_tx` | `transactions:request` | `domain`, `kind`, `valueKind?`, `value?`, `rawCategory?`, `keyName?` |
| `dns.send_name_tx` | `transactions:request` | `domain`, `action`: `mint`, `bid`, or `release` |
| `dns.send_renew_tx` | `transactions:request` | `domains[]`, 1–4 unique names |

Record `kind` and optional `valueKind` are `wallet`, `site`, `storage`, `resolver`, `text`, `adnl`, or `other`. Use `value: null` to clear a record.

## Subdomains

| Tool | Permission | Input |
|---|---|---|
| `subdomains.list_collections` | `subdomains:read` | `limit?` 1–100, `cursor?` |
| `subdomains.list_items` | `subdomains:read` | `limit?` 1–100, `cursor?` |
| `subdomains.get_collection` | `subdomains:read` | `collectionAddress` |
| `subdomains.get_item` | `subdomains:read` | `itemAddress` |
| `subdomains.control` | `subdomains:read` | `collectionAddress` |
| `subdomains.create_collection_tx` | `transactions:request` | `parentAddress`, `mode`, 11-entry `priceGrid`, `minChars` 1–4 |
| `subdomains.mint_tx` | `transactions:request` | `collectionAddress`, `parent`, `label`, `setWalletToMinter?` |
| `subdomains.collection_action_tx` | `transactions:request` | `collectionAddress`, `action`, action-specific optional fields |
| `subdomains.transfer_item_tx` | `transactions:request` | `itemAddress`, `newOwner` |
| `subdomains.recovery_tx` | `transactions:request` | `parentAddress`, `mode`, `action` |

Collection `mode` is `locked` or `linked`. Read [subdomains-methods.md](subdomains-methods.md) for action-specific fields and eligibility.

## TON Storage

| Tool | Permission | Input |
|---|---|---|
| `storage.list_bags` | `storage:read` | none |
| `storage.bag_details` | `storage:read` | `bagId` |
| `storage.providers` | `storage:read` | `bagId`, `sort?` |
| `storage.provider_funding_session` | `storage:read` | `bagId`, `providerPubkeys[]` |
| `storage.provider_funding_preview` | `storage:read` | `bagId`, `sessionId`, `targetCoverageSeconds`, `proofSpanSeconds` |
| `storage.provider_quote` | `storage:read` | `bagId`, `sessionId`, `targetCoverageSeconds`, `proofSpanSeconds` |
| `storage.provider_operation` | `storage:read` | UUID `providerOperationId` |
| `storage.send_bag_link_tx` | `transactions:request` | `bagId`, `domain` |
| `storage.send_provider_tx` | `transactions:request` | `action`, `bagId`, `quoteId?`, `targetCoverageSeconds?`, `providerPubkey?`, `acknowledgeOtherProviders?` |
| `storage.create_bag` | `storage:write` | `name?`, `files[]` with `name?` / `path?` and one of `text` / `contentBase64` |
| `storage.pin_bag` | `storage:write` | `bagId`, `name?` |
| `storage.delete_bag` | `storage:delete` | `bagId`, matching `confirmBagId` |

Provider sort is `recommended`, `cheapest`, `uptime`, or `capacity`; provider action is `pin`, `top_up`, `stop`, or `withdraw`. Read [storage-methods.md](storage-methods.md) before any paid-provider workflow.

## Fixed resources

| URI | Permission |
|---|---|
| `tonsite://wallet` | `wallet:read` |
| `tonsite://sites` | `sites:read` |
| `tonsite://deployments` | `deployments:read` |
| `tonsite://domains` | `dns:read` |
| `tonsite://bags` | `storage:read` |

The server exposes no resource templates or prompts. The exact live runtime schema remains canonical if this document and `tools/list` ever differ.
