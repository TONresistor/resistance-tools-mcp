---
name: sites
description: Publish, inspect, update, roll back, or delete TON Sites with Resistance Tools. Use for site lists and content, file or template publishing, image uploads, release history, deployment history, gateway links, DNS-link status, and product-payment retries related to publishing.
---

# Sites

Operate the `resistance-tools` MCP with the runtime tool schema as the source of truth. Complete the requested site action, verify the resulting release and link state, then give the user the useful result instead of raw tool output.

## Workflow

1. Resolve the exact target: `name.ton`, `child.name.ton`, `username.t.me`, or `child.username.t.me`.
2. Call `sites.list` before a mutation. Call `sites.get_content` before editing a template site and preserve fields the user did not ask to change.
3. Choose one publication path:
   - use `sites.publish_files` for an explicit static file tree with a regular `index.html`;
   - use `sites.publish_template` for a supported structured template;
   - call `media.upload_image` first when the template needs an uploaded image.
4. If a product tool returns `payment_required`, use the `transactions` skill for `payments.send_tx`, wait for confirmation, then retry the original product tool.
5. After publish or rollback, call both `sites.list` and `sites.list_releases`. Require the intended release to be active before reporting success.
6. If the user wants to link the published site to TON DNS, use the `transactions` skill for `sites.send_link_tx`, then verify with `domains.records` or `sites.list` after confirmation.
7. For deletion, require explicit user intent, send the exact same normalized site as `site` and `confirmSite`, then verify that `sites.list` no longer contains the deployment.

Read [references/tools.md](references/tools.md) before calling a site, deployment, media, rollback, or delete tool. Read [references/templates.md](references/templates.md) before creating or modifying template content.

## State rules

- Treat publication and DNS linking as separate events.
- Say `live` only when `sites.list` or `domains.records` proves `live` or `linkedHere: true`.
- A root target has a versioned gateway: `https://<name>.ton.resistance.dog/?v=<releaseId>` or `https://<username>.t.me.resistance.dog/?v=<releaseId>`.
- For a child target, provide `tonsite://<full-name>` and do not invent a public HTTPS gateway.
- Use `deployments.list` for history and `sites.list` for current state.
- A transaction link means awaiting user confirmation, never published, linked, paid, or confirmed.

## Required user response

After a verified publication, answer in the user's language with this compact information:

```text
Site published

Domain: <site>
Gateway: <labeled versioned gateway, when supported>
TON Site: tonsite://<site>
Release: #<number> (<releaseId>)
Status: live | published, DNS not linked here
```

For rollback, include the restored release and refreshed link. For deletion, state that the deployment was deleted and TON DNS was unchanged. If verification is unavailable, state that single boundary instead of claiming completion.
