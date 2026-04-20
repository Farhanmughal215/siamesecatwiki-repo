# siamese.wiki

Static-site build of siamese.wiki. No dependencies, no build step.

---

## Start the dev server

```bash
python3 -m http.server 8000
# then open http://localhost:8000/site/
```

Any static file server works (Live Server, `serve`, Vite preview, etc.). Open **`/site/index.html`** — not the project root.

---

## Read these first (in order)

1. **HANDOFF.md** — project overview, architecture, deploy guide, **full asset list with search queries**
2. **CLAUDE.md** — editorial brief (voice, CTA tiers, sources policy)
3. **writer-guide.md** — detailed writer style guide
4. **roadmap.md** — the 30-article plan

---

## Structure

```
articles/        ← 30 markdown articles + manifest.json (content source)
assets/          ← image placeholders — drop real images here per HANDOFF.md
site/            ← the actual website (HTML/CSS/JS)
```

---

## What's live right now

- 30 long-form articles rendering from markdown
- Homepage, article index, article template, about page
- Café CTA tiers (loud / medium / subtle) wired into each article
- Procedurally-generated SVG image placeholders — replace by dropping files at the paths in `assets/`
- Search on the article index page (title + deck + quick answer)

## What's not done yet

- Real images (see HANDOFF.md → **ASSET LIST**)
- FAQ JSON-LD schema markup
- Sitemap.xml
- Full-text search indexing
- Migration to an SSG (optional, but recommended past ~50 articles)

See HANDOFF.md for full next-step priorities.
"# siamesecatwiki" 
"# siamesecatwiki-repo" 
"# siamesecatwiki-repo" 
