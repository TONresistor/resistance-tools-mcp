# Sites, releases, media, deployments, and templates

Use the runtime schema as canonical. Supported targets are `name.ton`, `child.name.ton`, `username.t.me`, and `child.username.t.me`.

## Contents

- Workflow and state rules
- Tool methods
- Template schemas

## Workflow and state rules

1. Use `sites.list` only when the user needs discovery or selection. When the user supplies an exact site, use exact-site reads instead of enumerating every site.
2. Before publishing to an exact target, call `sites.list_releases` once to identify an existing deployment; `not_found` means the target is new. Read `sites.get_content` only before editing an existing template. Use `sites.publish_files` for an explicit file tree or `sites.publish_template` for structured content. Upload template images first.
3. After publish or rollback, call `sites.list_releases` for the exact site and require the intended release to be active. Read `domains.records` only when DNS-link state matters.
4. If publication returns `payment_required`, load `transactions.md`, prepare `payments.send_tx`, wait for confirmation, then retry the original publication tool.
5. To link DNS, load `transactions.md` for `sites.send_link_tx`, then verify the exact target with `domains.records`.

Treat publication and DNS linking as separate events. Say `live` only when an exact read-back proves `linkedHere: true` or an explicit site status read proves `live`. Root targets have a versioned gateway; child targets use `tonsite://<full-name>` and must not receive an invented HTTPS gateway.

After verified publication, return domain, labeled versioned gateway when supported, `tonsite://` link, release number/id, and verified link status. For deletion, state that the deployment was deleted and TON DNS was unchanged.

```text
Site published

Domain: <site>
Gateway: <labeled versioned gateway, when supported>
TON Site: tonsite://<site>
Release: #<number> (<releaseId>)
Status: live | published, DNS not linked here
```

### `sites.list`

- **Permission:** `sites:read`.
- **Input:** none.
- **Use:** Discover owned sites and read template, release, size, file count, and DNS-link status.
- **Method:** Call only when the user asks to list/select sites or when no exact target is available. Do not call it as a routine preflight or read-back for a named site.
- **Verify:** Use the returned current row for platform state. An absent row does not by itself prove public DNS state.
- **Report:** Give the relevant site, active release, and link status; summarize large lists.

### `sites.get_content`

- **Permission:** `sites:read`.
- **Input:** exact `site`.
- **Use:** Read stored template metadata before editing a template site.
- **Method:** Call before `sites.publish_template`; preserve fields the user did not ask to change.
- **Verify:** A `null` template/content may represent a file-based deployment, not a broken site.
- **Report:** Summarize the current template and requested fields without dumping large content blobs.

### `sites.list_releases`

- **Permission:** `sites:read`.
- **Input:** exact `site`.
- **Use:** Identify retained releases, active version, release numbers, sizes, and rollback targets.
- **Method:** Call directly for the exact site after each publication and before every rollback.
- **Verify:** Select the exact returned release `id`; never derive or guess it from order or time.
- **Report:** Give the human release number plus id when both exist and identify which release is active.

### `media.upload_image`

- **Permission:** `media:write`.
- **Input:** raw `contentBase64` for PNG, JPEG, GIF, or WebP; no data-URL prefix.
- **Use:** Upload an image referenced by a structured site template.
- **Method:** Upload before publication, then put the returned `media/<sha256>.<ext>` path in template content.
- **Verify:** Check returned `path`, `mediaType`, and `sizeBytes`. Never echo the base64.
- **Report:** Say the image is ready and give only its media path unless the site was also published.

### `sites.publish_files`

- **Permission:** `sites:write`.
- **Input:** `site`; non-empty `files[]`, each with `path` and exactly one of `text` or raw `contentBase64`.
- **Use:** Publish an explicit static file tree.
- **Method:** Require a regular `index.html` and preserve exact intended paths. Work from local files when the user wants a project or source changes; send one-off generated files directly when they exist only for this publication. Never create a throwaway local project just to stage generated content.
- **Verify:** Call `sites.list_releases` for the exact site; require a new active release and use its id in supported gateway links. Use `domains.records` only when link state matters.
- **Report:** Include domain, versioned gateway when supported, `tonsite://` link, release, and verified DNS-link status.

### `sites.publish_template`

- **Permission:** `sites:write`.
- **Input:** `site`, supported `template`, and validated `content`.
- **Use:** Validate, render, and publish a supported structured template.
- **Method:** Read existing content when editing, use the template schemas below, upload images first, and preserve unrelated fields.
- **Verify:** Call `sites.list_releases` for the exact site; require the new active release. Read the exact template content only when the requested change requires it.
- **Report:** Include domain, useful links, release, and verified DNS status. Never say `live` without read-back proof.

### `sites.rollback`

- **Permission:** `sites:rollback`.
- **Input:** `site`, exact `releaseId`, and identical normalized `confirmSite`.
- **Use:** Restore one retained release after explicit user intent.
- **Method:** Call `sites.list_releases`, show or resolve the exact target release, then send the confirmation fields.
- **Verify:** Re-read `sites.list_releases` for the exact site and require the selected release to be active.
- **Report:** State the site, restored release number/id, and refreshed gateway or TON Site link.

### `sites.delete`

- **Permission:** `sites:delete`.
- **Input:** `site` and identical normalized `confirmSite`.
- **Use:** Delete an owned deployment and served release files after explicit user intent.
- **Method:** Use the exact user-supplied site, explain that DNS is separate, then send the confirmation fields. Use discovery only if the target is missing or ambiguous.
- **Verify:** Re-read `sites.list_releases` for the exact site and require `not_found`. Use `domains.records` separately if DNS state matters.
- **Report:** Say the deployment was deleted and explicitly state that TON DNS was unchanged.

### `deployments.list`

- **Permission:** `deployments:read`.
- **Input:** none.
- **Use:** Inspect publication, rollback, deletion, and failure history across owned sites.
- **Method:** Call for chronology or provenance and select the site/action relevant to the question.
- **Verify:** Use an exact-site read for current state; history alone does not prove what is live.
- **Report:** Give the latest relevant event, release, timestamp, and outcome without dumping the full history.

## Template schemas

Use only these fields with `sites.publish_template`. Unknown fields are discarded by the canonical validator. Template content is structured data, never raw HTML.

Image fields use the `media/<hash>.<ext>` path returned by `media.upload_image`. Uploads accept PNG, JPEG, GIF, and WebP up to 8 MiB.

### Template `links`

Required: `name`, `links` as `[{"title":"...","url":"..."}]`.

Optional: `bio`, `profileLayout` (`2` or `3`), `avatar`, `accent`, `telegram`, `recipient`, `profileActions`, `visibleSections`, `blocks`, `aboutBlocks`, `theme`.

### Template `blog`

Required: `title`, `date` in `YYYY-MM-DD`, and `blocks`.

Optional: `theme`. Blocks support paragraph/header/quote (`p`, `h`, `quote` with `s` text runs), image (`img` with media `src`), YouTube (`yt`), and separator (`hr`).

### Template `redirect`

Required: HTTPS `destination`.

### Template `token`

Required: `name`, `ticker`, checksum-valid mainnet `address`, media `logo`, and `links`.

Optional: `description`, media `banner`, `website`, `channel`, `group`, `theme`.

### Template `sale`

Required: `price`, `currency` (`GRAM` or `USD`), `description`, `telegram`, `textColor`, `backgroundColor`, `highlightColor`.

Optional: media `image`, `cardColor` (defaults to `highlightColor`), `cardOpacity` as integer 0–100 (defaults to 10).

### Template `tip`

Required: `name`, `description`, checksum-valid mainnet `recipient`, and `assets`.

Optional: `language` (default `en`), exactly three `amounts` (default `5`, `10`, `25`), media `avatar`, and `theme`. Languages: `en`, `ru`, `zh`, `de`, `it`, `es`, `hi`. Asset kinds: `gram`, `usdt`, or `jetton` with `master`, `name`, `symbol`, and `decimals`.

### Shared template validation

- Colors are six-digit hex values.
- When `theme` is present, require `textColor`, `backgroundColor`, `surfaceColor`, and `accentColor`.
- Safe link schemes are HTTP, HTTPS, Telegram, TON, and mailto.
- Preserve unrelated existing fields when editing a template.
