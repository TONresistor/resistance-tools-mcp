# Site template schemas

Use only these fields with `sites.publish_template`. Unknown fields are discarded by the canonical validator. Template content is structured data, never raw HTML.

Image fields use the `media/<hash>.<ext>` path returned by `media.upload_image`. Uploads accept PNG, JPEG, GIF, and WebP up to 8 MiB.

## `links`

Required: `name`, `links` as `[{"title":"...","url":"..."}]`.

Optional: `bio`, `profileLayout` (`2` or `3`), `avatar`, `accent`, `telegram`, `recipient`, `profileActions`, `visibleSections`, `blocks`, `aboutBlocks`, `theme`.

## `blog`

Required: `title`, `date` in `YYYY-MM-DD`, and `blocks`.

Optional: `theme`. Blocks support paragraph/header/quote (`p`, `h`, `quote` with `s` text runs), image (`img` with media `src`), YouTube (`yt`), and separator (`hr`).

## `redirect`

Required: HTTPS `destination`.

## `token`

Required: `name`, `ticker`, checksum-valid mainnet `address`, media `logo`, and `links`.

Optional: `description`, media `banner`, `website`, `channel`, `group`, `theme`.

## `sale`

Required: `price`, `currency` (`GRAM` or `USD`), `description`, `telegram`, `textColor`, `backgroundColor`, `highlightColor`.

Optional: media `image`, `cardColor` (defaults to `highlightColor`), `cardOpacity` as integer 0–100 (defaults to 10).

## `tip`

Required: `name`, `description`, checksum-valid mainnet `recipient`, and `assets`.

Optional: `language` (default `en`), exactly three `amounts` (default `5`, `10`, `25`), media `avatar`, and `theme`. Languages: `en`, `ru`, `zh`, `de`, `it`, `es`, `hi`. Asset kinds: `gram`, `usdt`, or `jetton` with `master`, `name`, `symbol`, and `decimals`.

## Shared validation

- Colors are six-digit hex values.
- When `theme` is present, require `textColor`, `backgroundColor`, `surfaceColor`, and `accentColor`.
- Safe link schemes are HTTP, HTTPS, Telegram, TON, and mailto.
- Preserve unrelated existing fields when editing a template.
