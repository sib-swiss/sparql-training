import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import MarkdownIt from 'markdown-it';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '_site');

// Ordered list of pages that make up the site nav, plus their source markdown
// and output location. Add new pages here.
const PAGES = [
  { src: 'index.md', out: 'index.html', title: 'Home' },
  { src: 'default/tutorial.md', out: 'default/tutorial.html', title: 'SPARQL basics' },
  { src: 'uniprot/00_introduction.md', out: 'uniprot/00_introduction.html', title: 'UniProt · Introduction' },
  { src: 'uniprot/01_basic_information.md', out: 'uniprot/01_basic_information.html', title: 'UniProt · Basic information' },
  { src: 'uniprot/02_protein_name.md', out: 'uniprot/02_protein_name.html', title: 'UniProt · Protein names' },
  { src: 'uniprot/03_replicon_gene.md', out: 'uniprot/03_replicon_gene.html', title: 'UniProt · Replicon & genes' },
  { src: 'uniprot/04_taxonomy.md', out: 'uniprot/04_taxonomy.html', title: 'UniProt · Taxonomy' },
  {
    src: 'rhea/SWAT4HCLS_2019/rhea_tutorial_SWAT4HCLS_2019.md',
    out: 'rhea/SWAT4HCLS_2019/rhea_tutorial_SWAT4HCLS_2019.html',
    title: 'Rhea · Metabolism tutorial',
  },
];

function depthPrefix(outRelPath) {
  const depth = outRelPath.split('/').length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

/** Parses a fence info string like: sparql fixture=basic-entry title="A title" */
function parseFenceAttrs(info) {
  const rest = info.trim().split(/\s+/).slice(1).join(' ');
  const attrs = {};
  const re = /(\w[\w-]*)=("([^"]*)"|(\S+))/g;
  let m;
  while ((m = re.exec(rest))) {
    attrs[m[1]] = m[3] !== undefined ? m[3] : m[4];
  }
  return attrs;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildMarkdownRenderer() {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  const defaultFence = md.renderer.rules.fence;

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
  const items = PAGES.map((page) => {
    const href = depthPrefix(currentOut) + page.out;
    const isActive = page.out === currentOut;
    return `    <a href="${href}"${isActive ? ' class="active"' : ''}>${escapeHtml(page.title)}</a>`;
  });
  return items.join('\n');
}

function buildClientBundles() {
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'src/comunica-entry.js')],
    bundle: true,
    minify: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    outfile: path.join(OUT, 'assets/js/comunica-bundle.js'),
    logLevel: 'info',
  });

  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'src/graph-entry.js')],
    bundle: true,
    minify: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    outfile: path.join(OUT, 'assets/js/graph-bundle.js'),
    logLevel: 'info',
  });
}

function copyStaticAssets() {
  mkdirSync(path.join(OUT, 'assets/css'), { recursive: true });
  mkdirSync(path.join(OUT, 'assets/js'), { recursive: true });
  cpSync(path.join(__dirname, 'assets/css/style.css'), path.join(OUT, 'assets/css/style.css'));
  cpSync(path.join(__dirname, 'assets/js/sparql-runner.js'), path.join(OUT, 'assets/js/sparql-runner.js'));
}

function buildPages(md, layout) {
  for (const page of PAGES) {
    const srcPath = path.join(ROOT, page.src);
    const markdown = readFileSync(srcPath, 'utf8');
    const title = extractTitle(markdown, page.title);
    const contentHtml = md.render(markdown);
    const base = depthPrefix(page.out);

    const html = layout
      .replaceAll('{{TITLE}}', escapeHtml(title))
      .replaceAll('{{BASE}}', base)
      .replace('{{NAV}}', renderNav(page.out))
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

  const md = buildMarkdownRenderer();
  const layout = readFileSync(path.join(__dirname, 'templates/layout.html'), 'utf8');
  buildPages(md, layout);

  console.log(`\nBuilt site into ${path.relative(ROOT, OUT)}/`);
}

main();
