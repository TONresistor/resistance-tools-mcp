# Site, release, media, and deployment tools

Use the runtime schema as canonical. Supported targets are `name.ton`, `child.name.ton`, `username.t.me`, and `child.username.t.me`.

### `sites.list`

- **Permission:** `sites:read`.
- **Input:** none.
- **Use:** Discover owned sites and read template, release, size, file count, and DNS-link status.
- **Method:** Call first for site selection and after publish, rollback, or delete. Match the exact normalized site.
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
- **Method:** Call after `sites.list`, after each publication, and before every rollback.
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
- **Method:** Read `sites.list`; require a regular `index.html`; preserve exact intended paths; then publish.
- **Verify:** Call `sites.list` and `sites.list_releases`; require a new active release and use its id in supported gateway links.
- **Report:** Include domain, versioned gateway when supported, `tonsite://` link, release, and verified DNS-link status.

### `sites.publish_template`

- **Permission:** `sites:write`.
- **Input:** `site`, supported `template`, and validated `content`.
- **Use:** Validate, render, and publish a supported structured template.
- **Method:** Read existing content when editing, load `references/templates.md`, upload images first, and preserve unrelated fields.
- **Verify:** Call `sites.list` and `sites.list_releases`; require the expected template and new active release.
- **Report:** Include domain, useful links, release, and verified DNS status. Never say `live` without read-back proof.

### `sites.rollback`

- **Permission:** `sites:rollback`.
- **Input:** `site`, exact `releaseId`, and identical normalized `confirmSite`.
- **Use:** Restore one retained release after explicit user intent.
- **Method:** Call `sites.list_releases`, show or resolve the exact target release, then send the confirmation fields.
- **Verify:** Re-read `sites.list` and `sites.list_releases`; require the selected release to be active.
- **Report:** State the site, restored release number/id, and refreshed gateway or TON Site link.

### `sites.delete`

- **Permission:** `sites:delete`.
- **Input:** `site` and identical normalized `confirmSite`.
- **Use:** Delete an owned deployment and served release files after explicit user intent.
- **Method:** Read `sites.list`, resolve the exact target, explain that DNS is separate, then send the confirmation fields.
- **Verify:** Re-read `sites.list` and require the deployment row to be absent. Use `domains.records` separately if DNS state matters.
- **Report:** Say the deployment was deleted and explicitly state that TON DNS was unchanged.

### `deployments.list`

- **Permission:** `deployments:read`.
- **Input:** none.
- **Use:** Inspect publication, rollback, deletion, and failure history across owned sites.
- **Method:** Call for chronology or provenance and select the site/action relevant to the question.
- **Verify:** Use `sites.list` for current state; history alone does not prove what is live.
- **Report:** Give the latest relevant event, release, timestamp, and outcome without dumping the full history.
