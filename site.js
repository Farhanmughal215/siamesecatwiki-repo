// Shared site JS — renders header/footer, markdown, loads manifest

const MAPS_URL = 'https://maps.app.goo.gl/o2Z7yN1yRLNKScro8';
const CAFE_URL = 'https://siamesecat.cafe/';

// ── HEADER + FOOTER ─────────────────────────────────────────────────
function renderChrome(activePage) {
  const headerHTML = `
    <div class="sponsor-strip">
      Sponsored by <a href="${CAFE_URL}" target="_blank" rel="noopener">Siamese Cat Café</a>
      <span class="dot">·</span>
      Bangna, Bangkok <span class="dot">·</span>
      <a href="${MAPS_URL}" target="_blank" rel="noopener">Open Google Maps →</a>
    </div>
    <header class="site-header">
      <div class="wrap row">
        <a class="brand" href="index.html">
          <span class="mark">S</span>
          <span class="wordmark">siamese<span class="tld">.wiki</span></span>
        </a>
        <nav class="nav">
          <a href="index.html" ${activePage==='home'?'class="active"':''}>Home</a>
          <a href="articles.html" ${activePage==='articles'?'class="active"':''}>All articles</a>
          <a href="articles.html#colors-points">Colors</a>
          <a href="articles.html#behavior-personality">Behavior</a>
          <a href="articles.html#health">Health</a>
          <a href="articles.html#history-culture">History</a>
          <a href="about.html" ${activePage==='about'?'class="active"':''}>About</a>
        </nav>
        <a class="header-cta" href="${MAPS_URL}" target="_blank" rel="noopener">
          <span>🧡</span> Meet the cats
        </a>
      </div>
    </header>
  `;
  const footerHTML = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="cols">
          <div>
            <div class="brand"><span class="wordmark">siamese<span class="tld">.wiki</span></span></div>
            <p style="color:color-mix(in oklab, var(--paper), transparent 30%); margin:0; font-family:var(--f-body); font-size:15px; line-height:1.55; max-width:340px;">
              An independent wiki about the Siamese cat breed. Free, citation-based, and written for people who care about getting it right.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <a href="articles.html">All articles</a>
            <a href="articles.html#colors-points">Colors & points</a>
            <a href="articles.html#behavior-personality">Behavior</a>
            <a href="articles.html#health">Health</a>
            <a href="articles.html#history-culture">History</a>
          </div>
          <div>
            <h4>Siamese Cat Café</h4>
            <a href="${CAFE_URL}" target="_blank" rel="noopener">siamesecat.cafe</a>
            <a href="${MAPS_URL}" target="_blank" rel="noopener">Open in Google Maps</a>
            <a href="about.html">About this wiki</a>
          </div>
          <div>
            <h4>Visit</h4>
            <p style="color:color-mix(in oklab, var(--paper), transparent 30%); margin:0; font-size:13.5px; line-height:1.6;">
              Bangna, Bangkok<br>
              Open daily, 8 AM – 9 PM<br>
              Free entry
            </p>
          </div>
        </div>
        <div class="legal">
          <span>© 2026 siamese.wiki · A project of Siamese Cat Café</span>
          <span>Content CC BY-SA 4.0 · Editorially independent</span>
        </div>
      </div>
    </footer>
  `;
  document.getElementById('chrome-header').innerHTML = headerHTML;
  document.getElementById('chrome-footer').innerHTML = footerHTML;
}

// ── LOAD MANIFEST ───────────────────────────────────────────────────
let _manifest = null;
async function getManifest() {
  if (_manifest) return _manifest;
  const r = await fetch('../articles/manifest.json');
  _manifest = await r.json();
  return _manifest;
}

// ── MARKDOWN → HTML ─────────────────────────────────────────────────
// Minimal renderer tailored to our article shape
function renderMarkdown(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  
  function inline(s) {
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // footnote refs like [1] [12]
    s = s.replace(/\[(\d+)\]/g, '<sup class="fn">$1</sup>');
    return s;
  }
  
  while (i < lines.length) {
    const line = lines[i];
    const next = lines[i+1] || '';
    
    // CTA block
    if (line.trim() === ':::cta') {
      const buf = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing
      const text = buf.join(' ').trim();
      // parse "Label. Body text ...  Open in Google Maps →" etc.
      out.push(`<aside class="cta-inline">
        <div>
          <div class="label">🧡 Meet a real one</div>
          <p>${inline(text.replace(/\s*Open in Google Maps\s*→?\s*$/i,'').replace(/\s*Get directions\s*→?\s*$/i,'').trim())}</p>
        </div>
        <div class="cta-buttons">
          <a class="btn btn-primary" href="${MAPS_URL}" target="_blank" rel="noopener">Open Google Maps →</a>
        </div>
      </aside>`);
      continue;
    }
    
    // Blockquote (quick answer)
    if (line.startsWith('> ')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].substring(2));
        i++;
      }
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
      continue;
    }
    
    // Heading
    let m;
    if (m = line.match(/^(#{1,6})\s+(.+)/)) {
      const lvl = m[1].length;
      const text = m[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (lvl === 1) { out.push(`<h1 id="${id}">${inline(text)}</h1>`); }
      else { out.push(`<h${lvl} id="${id}">${inline(text)}</h${lvl}>`); }
      i++;
      continue;
    }
    
    // Table (pipe)
    if (line.startsWith('| ') && next.match(/^\|[\s\-\|:]+\|$/)) {
      const header = line.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].startsWith('| ')) {
        rows.push(lines[i].replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
        i++;
      }
      out.push('<table><thead><tr>' + header.map(h => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }
    
    // List
    if (line.match(/^[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      out.push('<ul>' + items.map(x => `<li>${inline(x)}</li>`).join('') + '</ul>');
      continue;
    }
    if (line.match(/^\d+\.\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      out.push('<ol>' + items.map(x => `<li>${inline(x)}</li>`).join('') + '</ol>');
      continue;
    }
    
    // Blank line
    if (line.trim() === '') { i++; continue; }
    
    // Paragraph — collect until blank or block
    const pbuf = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^(#|>|[-*]\s|\d+\.\s|\|)/) && lines[i].trim() !== ':::cta') {
      pbuf.push(lines[i]);
      i++;
    }
    if (pbuf.length) {
      out.push(`<p>${inline(pbuf.join(' '))}</p>`);
    }
  }
  
  return out.join('\n');
}

// ── HELPERS ─────────────────────────────────────────────────────────
function categorySlug(cat) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function catBadge(cat) {
  return `<span class="pill">${cat}</span>`;
}

function articleHref(a) {
  return `article.html?slug=${a.slug}`;
}

// Format reading time
function readingLabel(a) {
  return `${a.readingMins} min read`;
}
