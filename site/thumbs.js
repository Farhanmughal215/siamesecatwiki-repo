/* Image placeholder system ------------------------------------------------
   <img data-thumb="articles/07-seal-point"> will:
     1. attempt to load assets/images/{key}/hero.webp
     2. on error, swap to a generated SVG placeholder (data URI)
   OR explicit: <div data-placeholder="seal-point" data-cat="Colors & Points">
*/

const CATEGORY_COLORS = {
  'Overview':               { bg: '#ecd9b8', ink: '#3a2e26', accent: '#b8856a' },
  'Colors & Points':        { bg: '#f1dfce', ink: '#3a2e26', accent: '#c8734a' },
  'Behavior & Personality': { bg: '#d9d7e8', ink: '#2a2540', accent: '#6b6aa8' },
  'Care & Diet':            { bg: '#cde2d8', ink: '#1f3028', accent: '#4a8a6e' },
  'Health':                 { bg: '#efc9c3', ink: '#3d2020', accent: '#b84a42' },
  'History & Culture':      { bg: '#d8cfa6', ink: '#2e2a1a', accent: '#7a6a3a' },
};

// Hash a string into a stable 0-1 float
function _hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) / 2147483647;
}

// Build a generated SVG placeholder for an article
function placeholderSvg(opts) {
  const { title = '', category = 'Overview', num = 0, wide = true } = opts;
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS['Overview'];
  const w = wide ? 1600 : 1200;
  const h = wide ? 900 : 900;
  const seed = _hash(title + num);
  
  // Pick a motif from a small set — all are abstract + calm
  const motifs = [
    // 1. Soft circles (moons)
    () => {
      const cx1 = Math.round(300 + seed * 400);
      const cx2 = Math.round(w - 250 - seed * 200);
      const r1 = Math.round(180 + seed * 80);
      const r2 = Math.round(120 + seed * 60);
      const r3 = Math.round(80 + seed * 40);
      return `<circle cx="${cx1}" cy="${Math.round(h*0.55)}" r="${r1}" fill="${c.accent}" opacity="0.22"/><circle cx="${cx2}" cy="${Math.round(h*0.35)}" r="${r2}" fill="${c.accent}" opacity="0.14"/><circle cx="${Math.round(w*0.7)}" cy="${Math.round(h*0.72)}" r="${r3}" fill="${c.ink}" opacity="0.06"/>`;
    },
    // 2. Stacked horizons
    () => {
      const y1 = Math.round(h * (0.55 + seed * 0.1));
      return `<rect x="0" y="${y1}" width="${w}" height="${h-y1}" fill="${c.accent}" opacity="0.16"/><rect x="0" y="${y1+60}" width="${w}" height="${h-y1-60}" fill="${c.accent}" opacity="0.1"/><circle cx="${Math.round(w*0.78)}" cy="${y1-50}" r="70" fill="${c.accent}" opacity="0.3"/>`;
    },
    // 3. Off-center arch
    () => {
      const cx = Math.round(w * (0.3 + seed * 0.4));
      const rcirc = Math.round(30 + seed * 20);
      return `<path d="M ${cx-300} ${h} Q ${cx} ${Math.round(h*0.2)}, ${cx+300} ${h}" fill="${c.accent}" opacity="0.18"/><circle cx="${cx}" cy="${Math.round(h*0.45)}" r="${rcirc}" fill="${c.ink}" opacity="0.12"/>`;
    },
    // 4. Dotted field
    () => {
      let dots = '';
      for (let i = 0; i < 28; i++) {
        const s2 = _hash('d' + i + title);
        const x = Math.round(s2 * w);
        const y = Math.round(_hash('y' + i + title) * h);
        const r = Math.round(2 + _hash('r' + i) * 6);
        const op = (0.1 + _hash('o' + i) * 0.2).toFixed(2);
        dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.accent}" opacity="${op}"/>`;
      }
      return dots;
    },
  ];
  const motif = motifs[Math.floor(seed * motifs.length)]();
  
  const numLabel = num ? String(num).padStart(2, '0') : '';
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const catLabel = esc(category.toUpperCase());
  const numEl = numLabel ? `<text x="${w-80}" y="${h-60}" text-anchor="end" font-family="Georgia,serif" font-size="180" font-weight="300" fill="${c.ink}" opacity="0.15" font-style="italic">${esc(numLabel)}</text>` : '';
  
  // Build compact single-line SVG, no <pattern>, base64-encode for robustness
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><rect width="${w}" height="${h}" fill="${c.bg}"/>${motif}${numEl}<text x="60" y="80" font-family="sans-serif" font-size="18" font-weight="600" letter-spacing="3" fill="${c.ink}" opacity="0.55">${catLabel}</text></svg>`;
  // Use unicode-safe base64
  const b64 = btoa(unescape(encodeURIComponent(svg)));
  return 'data:image/svg+xml;base64,' + b64;
}

// Apply to an <img> — tries the real src, swaps to placeholder on 404.
function wireThumb(img, articleMeta, opts = {}) {
  const { wide = true, kind = 'hero' } = opts;
  const key = `articles/${String(articleMeta.num).padStart(2,'0')}-${articleMeta.slug.split('-').slice(0,3).join('-')}`;
  const realSrc = `../assets/images/${key}/${kind}.webp`;
  const fallback = placeholderSvg({
    title: articleMeta.title,
    category: articleMeta.category,
    num: articleMeta.num,
    wide,
  });
  
  img.onerror = () => {
    if (img.src !== fallback) {
      img.src = fallback;
      img.onerror = null;
    }
  };
  img.src = realSrc;
  img.alt = articleMeta.title;
}

// Build a complete <figure> with caption wired in
function thumbHtml(articleMeta, opts = {}) {
  const { kind = 'thumb', wide = true, className = '' } = opts;
  const fallback = placeholderSvg({
    title: articleMeta.title,
    category: articleMeta.category,
    num: articleMeta.num,
    wide,
  });
  return `<img class="${className}" src="${fallback}" alt="${articleMeta.title.replace(/"/g, '&quot;')}" loading="lazy" />`;
}

// Category-only placeholder (for homepage category grid)
function categoryPlaceholder(category) {
  return placeholderSvg({ title: category, category, num: 0, wide: true });
}

window.Thumbs = { placeholderSvg, wireThumb, thumbHtml, categoryPlaceholder, CATEGORY_COLORS };
