# Sites, releases, media, and payments

Read current state before changing a site. After publish or rollback, read both the site row and releases so the final answer contains the active release and correct link.

## Site links and status

- Root `.ton`: `https://<name>.ton.resistance.dog/?v=<releaseId>` and `tonsite://<name>.ton`.
- Root `.t.me`: `https://<username>.t.me.resistance.dog/?v=<releaseId>` and `tonsite://<username>.t.me`.
- Child `.ton` or `.t.me`: use `tonsite://<full-name>`; do not invent a public HTTPS gateway.
- Omit `?v=` only when no release id is available.
- `live` means linked to this platform, `elsewhere` means a site record points elsewhere, `none` means no site record, and `unknown` means the lookup was unavailable.

### `sites.list`

- **Use:** Discover owned sites and read current template, release, size, file count, and DNS-link status.
- **Method:** Call first for site selection and after publish, rollback, or delete.
- **Verify:** Match the exact normalized site name; do not treat an absent row as proof about public DNS.
- **Report:** Show the relevant site, release, and status. Summarize large lists instead of dumping every row.

### `sites.get_content`

- **Use:** Read stored template metadata before editing a template site.
- **Method:** Call with the exact site, then preserve fields the user did not ask to change.
- **Verify:** A `null` template/content can mean a file-based deployment, not an empty or broken site.
- **Report:** Summarize the template and requested fields; do not print large content blobs by default.

### `sites.list_releases`

- **Use:** Identify retained releases, the active version, release numbers, sizes, and rollback targets.
- **Method:** Call after `sites.list` for one exact site and before every rollback.
- **Verify:** Use the returned exact `id`; never guess a release id from time or order.
- **Report:** Prefer human release number plus id when both exist, and identify the active release.

### `media.upload_image`

- **Use:** Upload PNG, JPEG, GIF, or WebP bytes for a template.
- **Method:** Send raw base64 without a data-URL prefix, then place the returned `media/<sha256>.<ext>` path in template content.
- **Verify:** Check returned `path`, `mediaType`, and `sizeBytes`; never echo the base64.
- **Report:** Say the image is ready for the template and show only its media path unless publication also completed.

### `sites.publish_files`

- **Use:** Publish an explicit static file tree.
- **Method:** Read `sites.list`; send at least one file, require a regular `index.html`, and give each file exactly one of `text` or `contentBase64`.
- **Verify:** Call `sites.list` and `sites.list_releases`; confirm a new active release and use its id in supported gateway links.
- **Report:** Use the site-published format with domain, gateway/native link, release, and verified DNS status.

### `sites.publish_template`

- **Use:** Validate, render, and publish one supported structured template.
- **Method:** Read `sites.get_content` when editing, follow `templates.md`, upload images first, and preserve unrelated fields.
- **Verify:** Call `sites.list` and `sites.list_releases`; confirm the template and new active release.
- **Report:** Use the site-published format. Never say `live` unless the read-back status proves it.

### `sites.send_link_tx`

- **Use:** Create the TON DNS request that links an already published site to its owned domain.
- **Method:** Confirm the site exists, inspect `sites.list` / `domains.records`, then call with the exact site.
- **Verify:** First report only the returned confirmation URL. After user confirmation, call `domains.records` or `sites.list` and require `linkedHere: true` / `live`.
- **Report:** Before confirmation say `Link transaction ready`; after read-back say `Domain linked` and include the gateway.

### `payments.send_tx`

- **Use:** Create a payment request only after a product action returns `payment_required`.
- **Method:** Map the blocked action exactly to `deploy`, `publish`, or `media`; return the confirmation URL and wait for the user.
- **Verify:** After confirmation, retry the original product tool; its success is the usable payment verification.
- **Report:** Say payment confirmation is required, then report the original action only after its retry succeeds.

### `sites.rollback`

- **Use:** Restore one retained site release after an explicit user request.
- **Method:** Call `sites.list_releases`, select the exact `releaseId`, and send the exact site again as `confirmSite`.
- **Verify:** Re-read `sites.list` and `sites.list_releases`; require the selected release to be active.
- **Report:** State the site and restored release number/id, then provide the refreshed gateway/native link.

### `sites.delete`

- **Use:** Delete an owned deployment and served release files after explicit user intent.
- **Method:** Read `sites.list`, resolve the exact target, and send the same normalized value as `site` and `confirmSite`.
- **Verify:** Re-read `sites.list` and confirm the deployment row is absent. Use `domains.records` separately if DNS state matters.
- **Report:** Say the deployment was deleted and explicitly state that TON DNS was not changed.

### `deployments.list`

- **Use:** Inspect publish, rollback, delete, and failure history across owned sites.
- **Method:** Call for chronology or provenance, then filter to the site/action relevant to the question.
- **Verify:** Use `sites.list` for current state; history alone does not prove what is live now.
- **Report:** Give the latest relevant event, release, time, and outcome without dumping the full history.
