# Asset directory — siamese.wiki

Placeholder SVGs are generated on the fly by `site/thumbs.js`. When real images are added here, they automatically replace the placeholders — no code changes needed.

## Structure

```
assets/
├── CREDITS.md                    ← attribution log (REQUIRED for Wikimedia/CC)
├── images/
│   ├── hero-home.webp            ← homepage hero
│   ├── points/                   ← 4 point-color portraits
│   │   ├── seal-point.webp
│   │   ├── blue-point.webp
│   │   ├── chocolate-point.webp
│   │   └── lilac-point.webp
│   ├── categories/               ← 6 topic-area heroes
│   │   ├── overview.webp
│   │   ├── colors-points.webp
│   │   ├── behavior-personality.webp
│   │   ├── care-diet.webp
│   │   ├── health.webp
│   │   └── history-culture.webp
│   ├── articles/                 ← per-article hero images
│   │   ├── 01-siamese-cat-the/hero.webp
│   │   ├── 07-seal-point-siamese/hero.webp
│   │   └── ...
│   ├── history/                  ← public-domain historical material
│   └── cafe/                     ← café photography
└── _originals/                   ← pre-WebP originals (backup)
```

## Specs

| Use | Dimensions | Max size | Format |
|---|---|---|---|
| Homepage hero | 2400×1400 | 350KB | WebP |
| Point portraits | 1600×1000 | 200KB | WebP |
| Article heroes | 1600×900 | 250KB | WebP |
| Category cards | 1200×800 | 150KB | WebP |
| Historical | 1200–1600 long edge | 200KB | WebP |

## Naming rules

- All lowercase, hyphens only
- Match exactly what the JS expects (see `site/thumbs.js` → `wireThumb()`)
- For article heroes: `{NN}-{first-three-slug-words}` where NN is zero-padded article number

## What happens if an image is missing?

`site/thumbs.js` renders a procedurally-generated SVG placeholder — category-colored, with a large article-number watermark and abstract composition. The placeholder is deterministic (same article always gets the same placeholder), so the site looks intentional, not broken, during the content-population phase.

Drop a file at the expected path → automatic swap on next page load.
