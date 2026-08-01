# Remote tools

The hosted server exposes 26 tools. `?` means optional.

| Tool | Scope | Input |
|---|---|---|
| `auth.status` | public | none |
| `auth.policy` | public | none |
| `wallet.me` | `wallet:read` | none |
| `mcp.access.list` | `mcp:read` | none |
| `mcp.audit.list` | `mcp:read` | `limit?`, `method?`, `resultStatus?`, `since?` |
| `mcp.audit.summary` | `mcp:read` | `windowHours?`, `topMethodsLimit?` |
| `mcp.access.revoke_consent` | `mcp:revoke` | `consentId`, matching `confirmConsentId` |
| `sites.list` | `sites:read` | none |
| `sites.get_content` | `sites:read` | `site` |
| `sites.list_releases` | `sites:read` | `site` |
| `sites.publish_files` | `sites:write` | `site`, `files[]` with `path` and one of `text` / `contentBase64` |
| `sites.publish_template` | `sites:write` | `site`, `template`, `content` |
| `sites.rollback` | `sites:rollback` | `site`, `releaseId`, matching `confirmSite` |
| `sites.delete` | `sites:delete` | `site`, matching `confirmSite` |
| `deployments.list` | `deployments:read` | none |
| `dns.lookup` | `dns:read` | `name` |
| `domains.list` | `dns:read` | none |
| `domains.records` | `dns:read` | `domain` |
| `dns.prepare_record_tx` | `dns:prepare_tx` | `domain`, `kind`, `value?`, `rawCategory?`, `keyName?` |
| `dns.prepare_site_record_tx` | `dns:prepare_tx` | `domain`, `value?` |
| `media.upload_image` | `media:write` | `contentBase64` |
| `storage.list_bags` | `storage:read` | none |
| `storage.bag_details` | `storage:read` | `bagId` |
| `storage.create_bag` | `storage:write` | `name?`, `files[]` with `name?` / `path?` and one of `text` / `contentBase64` |
| `storage.pin_bag` | `storage:write` | `bagId`, `name?` |
| `storage.delete_bag` | `storage:delete` | `bagId`, matching `confirmBagId` |

## Media example

Send raw image bytes as base64, without a data-URL prefix:

```json
{
  "contentBase64": "iVBORw0KGgoAAA..."
}
```

The result includes `path`, `mediaType` and `sizeBytes`. Use `path` in a template field documented in [templates.md](templates.md).

## Template publish example

```json
{
  "site": "alice.ton",
  "template": "links",
  "content": {
    "name": "Alice",
    "links": []
  }
}
```

Supported site forms: `name.ton`, `child.name.ton`, `username.t.me`, `child.username.t.me`. The authenticated owner or delegation must cover the exact target.

## DNS record kinds

`dns.prepare_record_tx.kind` is one of `wallet`, `site`, `storage`, `resolver`, `text`, `adnl`, `other`. The returned transaction still requires wallet signature and broadcast.

## Fixed resources

| URI | Scope |
|---|---|
| `tonsite://wallet` | `wallet:read` |
| `tonsite://sites` | `sites:read` |
| `tonsite://deployments` | `deployments:read` |
| `tonsite://domains` | `dns:read` |
| `tonsite://bags` | `storage:read` |

The remote server currently exposes no resource templates and no prompts.
