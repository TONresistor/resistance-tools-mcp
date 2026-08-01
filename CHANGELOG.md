# Changelog

## 0.2.0 - Unreleased

1. Reviewed the backend MCP source as the canonical inventory: 26 remote tools, 5 fixed resources, 6 templates and 4 supported site target forms.
2. Added the shared backend image-upload service and the `media.upload_image` tool with the separate `media:write` OAuth scope, byte sniffing, quotas, payment handling and redacted audit input.
3. Aligned the canonical backend documentation with the media workflow, templates, targets, tools and resources.
4. Renamed the npm package to `@resistance-tools/mcp`, bumped the bridge to 0.2.0 and added `media:write` support.
5. Added a machine-readable MCP catalog, complete public docs, catalog tests, CI and a scheduled live contract check.
6. Independent review found and fixed the new-wallet disk-floor bypass and corrected the Tip template required/optional fields before final validation.
7. Added a permanent database-backed E2E test for the MCP upload scope, image write and redacted audit record, and wired it into CI after migration replay.
8. Final local validation passed: 454 existing tests plus the MCP upload E2E, lint, typechecks, Go test/vet, migration replay, backend/Mini App/Web builds, public package tests/catalog/dry-pack, and zero npm audit findings.
9. Committed and pushed backend SHA `b41559ecded05a8604153b03dfb50e42b18a59e1`; its exact GitHub CI run passed, including the new E2E step.
10. Deployed backend release `20260801T113645Z-b41559ecded0` to `gton`; provenance, readiness, restart count, logs, production smoke checks and the live 26-tool MCP contract all passed.

The npm package and GitHub release remain unpublished pending npm organization access and the publishing token.
