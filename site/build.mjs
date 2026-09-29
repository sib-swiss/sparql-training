import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import MarkdownIt from 'markdown-it';
import { parseFenceAttrs } from './lib/blocks.mjs';
import { exportNotebooks } from './export-notebooks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '_site');

function mdToHtml(src) {
  return src.replace(/\.md$/, '.html');
}

// Ordered list of pages that make up the site nav, plus their source markdown.
// Add new pages here -- just `src`, `title` and (optionally) `group`; `out` is
// derived from `src` automatically (every page's output is that same path
// with `.html` instead of `.md`, with no exceptions so far) unless a def sets
// its own `out` explicitly. Pages sharing a `group` are folded into one
// dropdown in the header nav, in the order they first appear.
export const PAGES = [
  { src: 'index.md', title: 'Home' },
  { src: 'intro/tutorial.md', title: 'RDF & linked data', group: 'Basics' },
  { src: 'intro/formats.md', title: 'RDF file formats', group: 'Basics' },
  { src: 'basic/tutorial.md', title: 'SPARQL basics', group: 'Basics' },
  { src: 'schema-org/tutorial.md', title: 'schema.org & Bioschemas' },
  { src: 'UniProt/00_introduction.md', title: 'Introduction', group: 'UniProt' },
  { src: 'UniProt/01_basic_information.md', title: 'Basic information', group: 'UniProt' },
  { src: 'UniProt/02_protein_name.md', title: 'Protein names', group: 'UniProt' },
  { src: 'UniProt/03_replicon_gene.md', title: 'Replicon & genes', group: 'UniProt' },
  { src: 'UniProt/04_taxonomy.md', title: 'Taxonomy', group: 'UniProt' },
  { src: 'UniProt/05_sequence.md', title: 'Sequence & isoforms', group: 'UniProt' },
  { src: 'UniProt/08_disease.md', title: 'Disease', group: 'UniProt' },
  { src: 'UniProt/09_cross_references.md', title: 'Cross-references', group: 'UniProt' },
  { src: 'UniProt/14_chemistry.md', title: 'Chemistry', group: 'UniProt' },
  { src: 'Rhea/rhea.md', title: 'Rhea · Metabolism tutorial' },
  { src: 'tools/tools.md', title: 'Tools & ecosystem' },
  { src: 'tips-and-tricks/tutorial.md', title: 'Tips and tricks: publishing your own RDF' },
].map((def) => ({ out: mdToHtml(def.src), ...def }));

function depthPrefix(outRelPath) {
  const depth = outRelPath.split('/').length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Comunica's own logo mark (just the icon glyph, not its "Comunica" wordmark
// -- the note itself spells that out as real, styleable text), vendored
// inline so a `note type=comunica-limitation` block never depends on an
// external asset path or its build-time depth from the page.
// Source: https://comunica.dev/img/comunica_red_no_fill.svg
const COMUNICA_ICON_SVG =
  '<svg viewBox="55 38 140 140" class="comunica-icon" aria-hidden="true">' +
  '<rect x="60" y="105.27" width="47.97" height="47.97"/>' +
  '<path d="M182,153.24H142v-48h48v40A8,8,0,0,1,182,153.24Z"/>' +
  '<path d="M189.67,82.72H60v-40a8,8,0,0,1,8-8H181.67a8,8,0,0,1,8,8Z"/>' +
  '<rect x="141.8" y="86.64" width="47.97" height="14.83"/>' +
  '<rect x="60" y="86.64" width="47.97" height="14.83"/>' +
  '<rect x="112.08" y="105.55" width="26.03" height="47.97"/>' +
  '<path d="M181.77,173.42h-32a8,8,0,0,1-8-8v-8.15h48v8.15A8,8,0,0,1,181.77,173.42Z"/>' +
  '<path d="M100,173.42H68a8,8,0,0,1-8-8v-8.15h48v8.15A8,8,0,0,1,100,173.42Z"/>' +
  '</svg>';

function buildMarkdownRenderer() {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  const defaultFence = md.renderer.rules.fence;

  // GitHub-style heading anchors (e.g. `## Q30: Foo` -> id="q30-foo"), so
  // pages can deep-link into each other's sections with a plain #fragment.
  // Also collects h2/h3 headings into `state.env.headings` (skipping the
  // page's own h1 title) so buildPages() can render an "on this page"
  // sidebar without a second markdown pass.
  md.core.ruler.push('heading_anchors', (state) => {
    const seen = new Map();
    const headings = (state.env.headings = state.env.headings || []);
    state.tokens.forEach((token, idx) => {
      if (token.type !== 'heading_open') return;
      const level = Number(token.tag.slice(1));
      const inline = state.tokens[idx + 1];
      const text = inline ? inline.content : '';
      let slug = slugify(text) || 'section';
      const count = seen.get(slug) || 0;
      seen.set(slug, count + 1);
      if (count > 0) slug = `${slug}-${count}`;
      token.attrSet('id', slug);
      if (level === 2 || level === 3) headings.push({ id: slug, text, level });
    });
  });

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim();
    const lang = info.split(/\s+/, 1)[0];
    const attrs = parseFenceAttrs(info);
    const code = escapeHtml(token.content.replace(/\n$/, ''));

    if (lang === 'turtle' && attrs.fixture) {
      return (
        `<details class="sparql-fixture" data-fixture-id="${attrs.fixture}" open>` +
        `<summary>Example data (Turtle)${attrs.title ? ' &ndash; ' + escapeHtml(attrs.title) : ''} <span class="sparql-editable-hint">&mdash; edit it, then re-run any query below</span></summary>` +
        `<pre class="sparql-fixture-data" contenteditable="true" spellcheck="false"><code class="language-turtle">${code}</code></pre>` +
        `<div class="sparql-fixture-toolbar">` +
        `<button type="button" class="sparql-btn sparql-graph-toggle">&#9679; Visualize as graph</button>` +
        `<button type="button" class="sparql-btn sparql-btn-secondary sparql-reset" data-reset-target="fixture">&#8630; Reset data</button>` +
        `</div>` +
        `<div class="sparql-graph" hidden></div>` +
        `</details>`
      );
    }

    if (lang === 'turtle' && attrs.shapes) {
      return (
        `<details class="sparql-fixture sparql-shacl-fixture" data-shapes-id="${attrs.shapes}" open>` +
        `<summary>SHACL shapes (Turtle)${attrs.title ? ' &ndash; ' + escapeHtml(attrs.title) : ''}</summary>` +
        `<pre class="sparql-fixture-data"><code class="language-turtle">${code}</code></pre>` +
        `<div class="sparql-fixture-toolbar">` +
        `<button type="button" class="sparql-btn sparql-shacl-graph-toggle">&#9679; Visualize shape diagram</button>` +
        `</div>` +
        `<div class="sparql-shacl-graph" hidden></div>` +
        `</details>`
      );
    }

    if (lang === 'sparql' && attrs.fixture) {
      return (
        `<div class="sparql-example" data-fixture-id="${attrs.fixture}">` +
        `<pre class="sparql-query" contenteditable="true" spellcheck="false"><code class="language-sparql">${code}</code></pre>` +
        `<div class="sparql-example-toolbar">` +
        `<button type="button" class="sparql-btn sparql-run">&#9654; Run query</button>` +
        `<button type="button" class="sparql-btn sparql-btn-secondary sparql-reset" data-reset-target="query">&#8630; Reset query</button>` +
        `</div>` +
        `<div class="sparql-results"></div>` +
        `</div>`
      );
    }

    if (lang === 'sparql' && attrs.live) {
      return (
        `<div class="sparql-example" data-live-endpoint="${escapeHtml(attrs.live)}">` +
        `<p class="sparql-reference-note">This query runs live against the real public endpoint ` +
        `<a href="${escapeHtml(attrs.live)}">${escapeHtml(attrs.live)}</a> &mdash; there's no local example data here, ` +
        `so it makes a real network request and results (and response time) depend on that service.</p>` +
        `<pre class="sparql-query" contenteditable="true" spellcheck="false"><code class="language-sparql">${code}</code></pre>` +
        `<div class="sparql-example-toolbar">` +
        `<button type="button" class="sparql-btn sparql-run">&#9654; Run query</button>` +
        `<button type="button" class="sparql-btn sparql-btn-secondary sparql-reset" data-reset-target="query">&#8630; Reset query</button>` +
        `</div>` +
        `<div class="sparql-results"></div>` +
        `</div>`
      );
    }

    if (lang === 'note' && attrs.type === 'comunica-limitation') {
      return (
        `<div class="comunica-note">` +
        COMUNICA_ICON_SVG +
        `<div class="comunica-note-body">` +
        `<p class="comunica-note-label">Comunica limitation</p>` +
        md.renderInline(token.content.trim()) +
        `</div>` +
        `</div>`
      );
    }

    if (lang === 'sparql' && attrs.reference) {
      return (
        `<div class="reference-block">` +
        `<p class="reference-label">Reference only &mdash; not runnable on this page: ${escapeHtml(attrs.reference)}</p>` +
        `<pre><code class="language-sparql">${code}</code></pre>` +
        `</div>`
      );
    }

    return defaultFence(tokens, idx, options, env, self);
  };

  return md;
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function renderNav(currentOut) {
  const base = depthPrefix(currentOut);

  const groupPages = new Map();
  for (const page of PAGES) {
    if (!page.group) continue;
    if (!groupPages.has(page.group)) groupPages.set(page.group, []);
    groupPages.get(page.group).push(page);
  }

  const renderedGroups = new Set();
  const items = [];

  for (const page of PAGES) {
    if (page.group) {
      if (renderedGroups.has(page.group)) continue;
      renderedGroups.add(page.group);

      const pages = groupPages.get(page.group);
      const isActiveGroup = pages.some((p) => p.out === currentOut);
      const links = pages
        .map((p) => {
          const href = base + p.out;
          const isActive = p.out === currentOut;
          return `        <a href="${href}"${isActive ? ' class="active"' : ''}>${escapeHtml(p.title)}</a>`;
        })
        .join('\n');

      items.push(
        `    <details class="nav-dropdown"${isActiveGroup ? ' open' : ''}>\n` +
          `      <summary${isActiveGroup ? ' class="active"' : ''}>${escapeHtml(page.group)}</summary>\n` +
          `      <div class="nav-dropdown-menu">\n${links}\n      </div>\n` +
          `    </details>`
      );
    } else {
      const href = base + page.out;
      const isActive = page.out === currentOut;
      items.push(`    <a href="${href}"${isActive ? ' class="active"' : ''}>${escapeHtml(page.title)}</a>`);
    }
  }

  return items.join('\n');
}

// Each client bundle is self-contained and loaded via a plain <script> tag in
// that order from templates/layout.html.
const CLIENT_BUNDLES = [
  ['src/comunica-entry.js', 'assets/js/comunica-bundle.js'],
  ['src/graph-entry.js', 'assets/js/graph-bundle.js'],
  ['src/prism-entry.js', 'assets/js/prism-bundle.js'],
];

function buildClientBundles() {
  for (const [entry, outfile] of CLIENT_BUNDLES) {
    esbuild.buildSync({
      entryPoints: [path.join(__dirname, entry)],
      bundle: true,
      minify: true,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      outfile: path.join(OUT, outfile),
      logLevel: 'info',
    });
  }
}

function copyStaticAssets() {
  mkdirSync(path.join(OUT, 'assets/css'), { recursive: true });
  mkdirSync(path.join(OUT, 'assets/js'), { recursive: true });
  cpSync(path.join(__dirname, 'assets/css/style.css'), path.join(OUT, 'assets/css/style.css'));
  cpSync(path.join(__dirname, 'assets/js/sparql-runner.js'), path.join(OUT, 'assets/js/sparql-runner.js'));
}

// Strips the light inline markdown a heading might carry (`` `code` ``,
// **bold**) down to plain text for the sidebar, since it's not rendered
// through markdown-it a second time.
function headingText(text) {
  return escapeHtml(text.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1'));
}

function renderPageToc(headings) {
  if (!headings || headings.length === 0) return '';
  const items = headings
    .map((h) => `      <li class="page-toc-h${h.level}"><a href="#${h.id}">${headingText(h.text)}</a></li>`)
    .join('\n');
  return (
    `<nav class="page-toc" aria-label="On this page">\n` +
    `    <p class="page-toc-title">On this page</p>\n` +
    `    <ul>\n${items}\n    </ul>\n` +
    `  </nav>`
  );
}

function renderNotebookLink(base, notebookPath) {
  if (!notebookPath) return '';
  return (
    `<p class="notebook-download"><a href="${base}${notebookPath}" download>` +
    `&#128211; Download this page as a Jupyter notebook</a></p>`
  );
}

function buildPages(md, layout, notebookFor) {
  for (const page of PAGES) {
    const srcPath = path.join(ROOT, page.src);
    const markdown = readFileSync(srcPath, 'utf8');
    const title = extractTitle(markdown, page.title);
    const env = {};
    const contentHtml = md.render(markdown, env);
    const base = depthPrefix(page.out);

    const html = layout
      .replaceAll('{{TITLE}}', escapeHtml(title))
      .replaceAll('{{BASE}}', base)
      .replace('{{NAV}}', renderNav(page.out))
      .replace('{{NOTEBOOK}}', renderNotebookLink(base, notebookFor.get(page.out)))
      .replace('{{TOC}}', renderPageToc(env.headings))
      .replace('{{CONTENT}}', contentHtml);

    const outPath = path.join(OUT, page.out);
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    console.log('wrote', page.out);

    // Pages may ship a sibling `assets/` folder (images, etc.) referenced with a
    // relative path from the markdown; mirror it next to the built page.
    const srcAssets = path.join(path.dirname(srcPath), 'assets');
    if (existsSync(srcAssets)) {
      cpSync(srcAssets, path.join(path.dirname(outPath), 'assets'), { recursive: true });
    }
  }
}

function main() {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  buildClientBundles();
  copyStaticAssets();
  const notebookFor = exportNotebooks(PAGES, ROOT, OUT);

  const md = buildMarkdownRenderer();
  const layout = readFileSync(path.join(__dirname, 'templates/layout.html'), 'utf8');
  buildPages(md, layout, notebookFor);

  console.log(`\nBuilt site into ${path.relative(ROOT, OUT)}/`);
}

// Only run the build when this file is executed directly (`node
// site/build.mjs`) -- not when another script (e.g. verify-examples.mjs)
// imports `PAGES` from it, which must not have the side effect of building
// the whole site.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
