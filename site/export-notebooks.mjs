// Generates a downloadable Jupyter notebook (.ipynb) for every page that has
// runnable examples, using rdflib to reproduce the same fixture-parse-then-
// query flow as the in-browser Comunica runner. This is how the site's
// tutorials worked before the rewrite to in-browser SPARQL, and some people
// still want a local Jupyter copy to run offline -- so it's kept as a
// generated export of the markdown source (which stays the single source of
// truth), not a second copy of the content to maintain by hand.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseMarkdownSegments, isAskQuery } from './lib/blocks.mjs';

function pyIdent(id) {
  let s = id.replace(/[^A-Za-z0-9_]/g, '_');
  if (/^[0-9]/.test(s)) s = `_${s}`;
  return s || 'g';
}

/** Escapes content for embedding inside a Python `"""..."""` string literal. */
function pyTripleQuoted(text) {
  return text.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"');
}

function isRelativeUrl(url) {
  return !/^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) && !url.startsWith('/') && !url.startsWith('#');
}

/**
 * Rewrites relative href/src attributes and markdown `](url)` targets in
 * PROSE text so they still resolve once the notebook lives one directory
 * deeper (under notebooks/) than the page it came from. Never touches fence
 * content -- callers must only pass prose segments here (fenced SPARQL can
 * legitimately contain `](` looking sequences, e.g. inside a SMILES string).
 */
function rewriteRelativeLinks(text, upPrefix) {
  return text
    .replace(/(src|href)="([^"]+)"/g, (m, attr, url) => (isRelativeUrl(url) ? `${attr}="${upPrefix}${url}"` : m))
    .replace(/\]\(([^)]+)\)/g, (m, url) => (isRelativeUrl(url) ? `](${upPrefix}${url})` : m));
}

function toSource(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => (i < lines.length - 1 ? `${line}\n` : line));
}

function markdownCell(text) {
  return { cell_type: 'markdown', metadata: {}, source: toSource(text) };
}

function codeCell(text) {
  return { cell_type: 'code', execution_count: null, metadata: {}, outputs: [], source: toSource(text) };
}

const SITE_URL = 'https://sib-swiss.github.io/sparql-training/';

function disclaimerCell(pageOut) {
  return markdownCell(
    `> **This notebook is generated from [an interactive tutorial page](${SITE_URL}${pageOut})** on the ` +
      'SIB SPARQL training site. Some of the text below refers to page elements that don\'t exist here ' +
      '(a "Run query" button, "Visualize as graph", editable boxes) — in this notebook, just run the code ' +
      'cells in order instead. Requires [rdflib](https://rdflib.readthedocs.io/): `pip install rdflib`.'
  );
}

function buildCells(markdown, upPrefix, pageOut) {
  const segments = parseMarkdownSegments(markdown);
  const cells = [disclaimerCell(pageOut)];
  const fixtureVar = new Map();

  for (const seg of segments) {
    if (seg.type === 'prose') {
      cells.push(markdownCell(rewriteRelativeLinks(seg.text, upPrefix)));
      continue;
    }

    const { lang, attrs, content } = seg;

    if (lang === 'turtle' && attrs.fixture) {
      const varName = pyIdent(attrs.fixture);
      fixtureVar.set(attrs.fixture, varName);
      cells.push(
        codeCell(
          `from rdflib import Graph\n\n` +
            `${varName} = Graph()\n` +
            `${varName}.parse(format="turtle", data="""\n${pyTripleQuoted(content)}\n""")\n` +
            `print(f"{len(${varName})} triples loaded")`
        )
      );
      continue;
    }

    if (lang === 'sparql' && attrs.fixture) {
      const varName = fixtureVar.get(attrs.fixture) || pyIdent(attrs.fixture);
      const body = isAskQuery(content)
        ? `result = ${varName}.query("""\n${pyTripleQuoted(content)}\n""")\nprint("ASK result:", result.askAnswer)`
        : `result = ${varName}.query("""\n${pyTripleQuoted(content)}\n""")\nfor row in result:\n    print(row)`;
      cells.push(codeCell(body));
      continue;
    }

    if (lang === 'sparql' && attrs.live) {
      const body =
        `from rdflib import Graph\n` +
        `from rdflib.plugins.stores.sparqlstore import SPARQLStore\n\n` +
        `store = SPARQLStore("${attrs.live}")\n` +
        `g = Graph(store=store)\n` +
        (isAskQuery(content)
          ? `result = g.query("""\n${pyTripleQuoted(content)}\n""")\nprint("ASK result:", result.askAnswer)`
          : `result = g.query("""\n${pyTripleQuoted(content)}\n""")\nfor row in result:\n    print(row)`);
      cells.push(codeCell(body));
      continue;
    }

    if (lang === 'sparql' && attrs.reference) {
      cells.push(
        markdownCell(`**Reference only — not executed here:** ${attrs.reference}\n\n\`\`\`sparql\n${content}\n\`\`\``)
      );
      continue;
    }

    // Any other fence (e.g. a plain, non-runnable reference block) -> inert markdown.
    cells.push(markdownCell(`\`\`\`${lang}\n${content}\n\`\`\``));
  }

  return cells;
}

function buildNotebook(cells) {
  return {
    cells,
    metadata: {
      kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
      language_info: { name: 'python', pygments_lexer: 'ipython3' },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };
}

/**
 * @param {Array<{src: string, out: string}>} pages
 * @param {string} rootDir  repo root (markdown sources live under here)
 * @param {string} outDir   built site root (`_site`)
 * @returns {Map<string, string|null>} page.out -> notebook path relative to
 *   outDir (e.g. "notebooks/uniprot-01_basic_information.ipynb"), or null if
 *   that page has no runnable examples and got no notebook.
 */
export function exportNotebooks(pages, rootDir, outDir) {
  const notebooksDir = path.join(outDir, 'notebooks');
  mkdirSync(notebooksDir, { recursive: true });

  const notebookFor = new Map();

  for (const page of pages) {
    const markdown = readFileSync(path.join(rootDir, page.src), 'utf8');
    const segments = parseMarkdownSegments(markdown);
    const hasFixtures = segments.some((s) => s.type === 'fence' && (s.attrs.fixture || s.attrs.live));

    if (!hasFixtures) {
      notebookFor.set(page.out, null);
      continue;
    }

    const pageDir = path.dirname(page.out); // '.' for a root-level page
    const upPrefix = pageDir === '.' ? '../' : `../${pageDir}/`;
    const slug = `${page.out.replace(/\.html$/, '').replace(/\//g, '-')}.ipynb`;

    const notebook = buildNotebook(buildCells(markdown, upPrefix, page.out));
    writeFileSync(path.join(notebooksDir, slug), JSON.stringify(notebook, null, 1));
    notebookFor.set(page.out, `notebooks/${slug}`);
    console.log('wrote notebook', slug);
  }

  return notebookFor;
}
