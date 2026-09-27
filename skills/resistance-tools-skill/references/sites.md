# Sites, releases, domains and templates

## Publish the requested content

Supported names: root `.ton`, root `username.t.me`, and one supported child under either. Publication is free. Use an exact site read when its identity is supplied; list only for discovery or when the current site name/ID is unknown. `sites.get_content` is needed to preserve fields when editing a template, not to enumerate every unrelated site.

Publish the intended static files or template, then inspect the exact active release. A template publish can return `hosting: storage`, `bagId` and `needsDnsLink`; preserve those fields. Link that Bag with `storage.send_bag_link_tx` when DNS linking is requested. `sites.send_link_tx` instead sets the platform ADNL record and is for ADNL-hosted content. A new local alias additionally requires the attachment workflow below. Never infer on-chain linkage from successful publication.

For root DNS read-back use `domains.records`; for an owned child use `subdomains.get_item` (discover its address only if needed). Compare category, value type and exact value. In particular, an ADNL-only `linkedHere` flag does not establish that a Storage BagID is linked.

Return concise useful links. Prefer a URL supplied by the server. The supported root gateways are `https://<name>.ton.run/` and `https://<name>.ton.resistance.dog/` for `.ton`, or `https://<username>.t.me.resistance.dog/` for a Username. Add `?v=<URL-encoded active release id>` when available. Do not invent an HTTPS gateway for a child name: use `tonsite://<full-name>`. A static file deployment is not a dynamic application runtime.

Example fields, selected as relevant: Domain: exact name; Gateway: labeled supported URL; TON Site: native link; Release: returned number/id; Status: published, pending DNS, or verified live.

## Domain attachments

Use `sites.list_domains` → `sites.preflight_domain` → the requested DNS confirmation if needed → `sites.attach_domain`. For removal, clear/change the exact DNS link if within the user's request, then `sites.unlink_domain`. A stale alias that changed owner can be detached locally but does not authorize changing its DNS.

Keep the stable site IDs from reads when moving names: a moved alias resolves to the new site afterward. Preflight again if a conflict changes. Moving a last alias can delete the source site; removing a last alias can delete the target site and its free Bag reference. Explain that additional effect and obtain intent if the original request did not cover it. Do not treat a permission error or conflict as approval for deletion.

### `sites.list`

**Permission:** `sites:read`.

Discover owned sites and their current IDs/names, hosting, releases and link states when needed. Use exact-site readers for a supplied target. Cached inventory is not authority for a write; the mutation service revalidates the affected ownership and mappings.

### `sites.get_content`

**Permission:** `sites:read`.

Read stored template/content metadata for an owned site before editing it. Preserve unrequested fields. Null content can mean a file-based deployment. Do not substitute a complete re-publication for a narrow content edit unless that is the supported publication primitive and the rest is preserved.

### `sites.list_releases`

**Permission:** `sites:read`.

Read exact retained release IDs, active state and human numbers when present. Use after publication and before/after rollback. Select returned IDs, not an assumed first row or invented timestamp. A confirmed absent site is compatible with a new publish; permission or ownership failures are not permission to overwrite it.

### `sites.publish_files`

**Permission:** `sites:write`.

Input: exact site and nonempty files with `path` and exactly one of `text` or raw `contentBase64`. Provide an `index.html`, preserve intended paths/content, and keep secrets or unrelated local files out. This publishes static content. Read the active release afterward; verify DNS separately when the task requires a live site.

### `sites.publish_template`

**Permission:** `sites:write`.

Input: exact site, supported template and content. Use the content guidance below because the generic MCP schema cannot describe every template variant. Upload image assets first and preserve existing content fields. After publishing, retain its hosting/Bag/link result and read back the active release. A renderer/editor update does not itself republish earlier user content.

### `media.upload_image`

**Permission:** `media:write`.

Upload raw base64 of PNG/JPEG/GIF/WebP, currently up to 8 MiB, without a data-URL prefix. Reuse the returned `media/<hash>.<ext>` path in content; do not invent a hosted image URL or echo base64. A remote image URL is not a template media path.

### `sites.rollback`

**Permission:** `sites:rollback`.

Read releases, select the requested exact `releaseId`, and pass normalized matching `site`/`confirmSite`. Read back the active release. Rollback serves the historical artifact; it does not re-render old content or promise to undo separate DNS/Storage transactions.

### `sites.delete`

**Permission:** `sites:delete`.

Read the exact site and intended effect, then use matching `site`/`confirmSite` once deletion is authorized. The backend refuses deletion while the site record still points here. Clearing DNS is a separate wallet-confirmed action; do not do it merely to suppress the guard. Verify the exact site is no longer present, and report deployment deletion separately from external DNS or paid-provider state.

### `deployments.list`

**Permission:** `deployments:read`.

List deployment history when the user asks for cross-site history or an audit. Events describe platform publication/rollback/deletion outcomes; they are not an on-chain transaction ledger. For one site's current artifact use its release reader instead.

### `sites.list_domains`

**Permission:** `sites:read`.

Read attachments by exact name or stable site ID. The response filters names by domain delegation and includes current link status; omission is not proof that no hidden aliases exist. Numeric IDs do not bypass site delegation. Preserve the stable ID for later checks if an alias will move.

### `sites.preflight_domain`

**Permission:** `sites:read`.

Read current domain ownership, linkage and source conflict for the exact target site/domain. Both affected sites must be owned and delegated. Retain the returned conflict ID and `willDeleteSite`; this check does not sign DNS or attach anything. Storage-source movement can require republishing instead of direct transfer of the local alias.

### `sites.attach_domain`

**Permission:** `sites:write`.

Require the DNS site record to point to the target ADNL endpoint or exact target BagID first. Pass exact `confirmSite`/`confirmDomain` and the reviewed `expectedConflictSiteId` if any. Deleting a last-domain source additionally needs explicit `confirmDeleteSourceSiteId` and `sites:delete`. Permissions and mappings are checked again under locks.

After success read target/source by their retained stable IDs. If the source was deliberately deleted, its missing state is expected. If an allowlisted source alias moved, loss of delegated access is a verification limit, not proof of deletion. Describe only the observed mapping and any explicitly confirmed deletion.

### `sites.unlink_domain`

**Permission:** `sites:write`.

Detach only after the exact DNS record no longer points to this site, or after the domain changed owner. Use exact `confirmSite`/`confirmDomain`. Last-domain removal requires authorized `confirmDeleteSite` and `sites:delete`; cleanup of its Storage Bag also requires `storage:delete` and Bag delegation. These permissions do not authorize withdrawing provider funds.

Read the site by its stable ID afterward. A last-domain deletion can make it absent; losing a delegated alias can also remove read access. Use the mutation's `deletedSite` result plus available read-back, and state an unavailable read honestly.

## Template content

All six templates use the backend parser as final validation. Preserve current content when editing; omitted fields can restore defaults. `schemaVersion` is backend-owned. Images use uploaded media paths. Do not invent a wallet, Jetton master or token metadata. Fixed themes require all four six-digit hex colors: `textColor`, `backgroundColor`, `surfaceColor`, `accentColor`.

### Template `links` (Profile)

`name` and `links: [{title, url}]`; links can be empty when the Links section is not explicitly enabled. Optional `bio`, `avatar`, `accent`, `telegram`, `recipient`, `profileLayout` (2 or 3), `theme`, legacy `blocks`, and v3 `aboutBlocks`. New v3 rich About content belongs in `aboutBlocks`; preserve existing layout on narrow edits.

`profileActions` contains `message` and/or `tip`; message needs `telegram`, tip needs `recipient`. An empty list hides actions without erasing their settings. `visibleSections` contains `links`, `ton_dns`, `telegram_usernames`; explicitly including `links` requires at least one link. `tipJar` supplies `assets`, optional `language` and three `amounts`, using the same settings as `tip`; it also requires a recipient. Include `tip` in the effective `profileActions` to display the Tip Jar. These controls render inside Profile, not as a separately published Tip page.

### Template `blog`

`title`, `date` (`YYYY-MM-DD`), `blocks`; optional `theme`. Rich blocks use `t`: `p`, `h`, `quote` with `s: [{text, b?, i?, u?, st?, href?}]`; `img` with media `src` and optional caption/width; `yt` with a YouTube `id`; or `hr`. Text alignment is optional `center`/`right`. Example paragraph: `{"t":"p","s":[{"text":"Hello"}]}`.

### Template `redirect`

`destination`: a canonical HTTPS URL. It is a redirect release, not a visible landing page. Do not add unrelated HTML or navigation.

### Template `token`

`name`, `ticker`, checksum-valid mainnet `address`, uploaded `logo`, `links`; optional `description`, media `banner`, `website`, `channel`, `group`, `theme`. Use supplied/verified token identity; publishing this page does not deploy or validate a token contract.

### Template `sale`

`price` (string), `currency` (`GRAM`/`USD`), `description`, `telegram`, `textColor`, `backgroundColor`, `highlightColor`. Optional media `image`, `buttonTextColor`, `webdom: true`, `marketAppUrl`, and legacy `cardColor`/`cardOpacity` (integer 0–100). Listing buttons are page content, not MCP market transactions; Webdom trading tools are not exposed. Preserve legacy fields on edits.

### Template `tip`

`name`, `description`, checksum-valid mainnet `recipient`, nonempty unique `assets` (up to eight). Asset variants: `{kind:"gram"}`, `{kind:"usdt"}`, or `{kind:"jetton",master,name,symbol,decimals}`. Canonical USDT must not also be added as a duplicate custom Jetton.

Optional uploaded `avatar`, `theme`, `language` (`en`, `ru`, `zh`, `de`, `it`, `es`, `hi`; default `en`) and exactly three positive decimal-string `amounts` (default `5`, `10`, `25`). Amount precision must fit every selected asset. Publishing tip controls does not transfer funds.
