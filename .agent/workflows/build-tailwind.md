---
description: How to rebuild Tailwind CSS after making class changes
---
// turbo-all

## Rebuild Tailwind CSS

Run this whenever you add/change Tailwind classes in HTML or JS files:

1. Build the CSS:
```
npm run build:css
```

This runs `npx @tailwindcss/cli -i tailwind-input.css -o tailwind-output.css --minify` and updates the output file.

## Watch Mode (Development)

For auto-rebuilding during development:

```
npm run dev:css
```

This watches all HTML/JS files and rebuilds automatically on changes.

## Notes
- The config is in `tailwind-input.css` (Tailwind v4 style)
- Dark mode uses class strategy: `@variant dark (&:where(.dark, .dark *))`
- Plugins: `@tailwindcss/forms`, `@tailwindcss/container-queries`
- Output file `tailwind-output.css` must be committed to git (no CDN fallback)
