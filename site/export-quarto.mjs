// Generates a downloadable Quarto document (.qmd) for every page that has
// runnable examples, reproducing the same fixture-parse-then-query flow as
// site/export-notebooks.mjs's Jupyter notebooks -- but in R, Quarto's own
// default language, using the rdflib package for the embedded example data
// and a small httr/jsonlite SPARQL-protocol helper for the `live=` examples.
// This is a second generated view of the same markdown source (which stays
// the single source of truth), not a second copy of the content to maintain
// by hand.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseMarkdownSegments, isAskQuery } from './lib/blocks.mjs';

function rIdent(id) {
  let s = id.replace(/[^A-Za-z0-9_.]/g, '_');
  if (!/^[A-Za-z.]/.test(s)) s = `g_${s}`;
  return s || 'g';
}

/** Escapes content for embedding inside a double-quoted R string literal (which may span multiple lines). */
function rQuoted(text) {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function isRelativeUrl(url) {
  return !/^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) && !url.startsWith('/') && !url.startsWith('#');
}

/**
 * Rewrites relative href/src attributes and markdown `](url)` targets in
 * PROSE text so they still resolve once the document lives one directory
 * deeper (under quarto/) than the page it came from. Never touches fence
 * content -- callers must only pass prose segments here.
 */
function rewriteRelativeLinks(text, upPrefix) {
  return text
    .replace(/(src|href)="([^"]+)"/g, (m, attr, url) => (isRelativeUrl(url) ? `${attr}="${upPrefix}${url}"` : m))
    .replace(/\]\(([^)]+)\)/g, (m, url) => (isRelativeUrl(url) ? `](${upPrefix}${url})` : m));
}

/** Escapes a string for embedding inside a double-quoted YAML scalar. */
function yamlDoubleQuoted(text) {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const SITE_URL = 'https://sib-swiss.github.io/sparql-training/';

function frontmatter(title) {
  return `---\n` + `title: "${yamlDoubleQuoted(title)}"\n` + `format:\n` + `  html:\n` + `    toc: true\n` + `---\n`;
}

// The ASK-to-SELECT rewrite this relies on: per the SPARQL 1.1 spec, `ASK {
// P }` is true iff `P` has at least one solution, so `nrow(rdf_query(graph,
// select_query)) > 0` is an exact, not approximate, way to answer an ASK
// query with the CSV-only result path that rdf_query() always takes --
// which has no defined serialization for a bare boolean. Handles both `ASK
// { ... }` and `ASK WHERE { ... }` forms.
const RDF_ASK_HELPER =
  `rdf_ask <- function(graph, query) {\n` +
  `  select_query <- sub("(?i)ASK(\\\\s+WHERE)?", "SELECT * WHERE", query, perl = TRUE)\n` +
  `  nrow(rdf_query(graph, select_query)) > 0\n` +
  `}`;

// A minimal SPARQL-protocol client over httr/jsonlite -- just enough to GET
// a query against a live public endpoint and read back the standard SPARQL
// 1.1 JSON results format, without depending on the long-archived CRAN
// `SPARQL` package.
const SPARQL_SELECT_HELPER =
  `sparql_select <- function(endpoint, query) {\n` +
  `  resp <- httr::GET(endpoint, query = list(query = query), httr::accept("application/sparql-results+json"))\n` +
  `  httr::stop_for_status(resp)\n` +
  `  res <- jsonlite::fromJSON(httr::content(resp, as = "text", encoding = "UTF-8"), simplifyVector = FALSE)\n` +
  `  vars <- res$head$vars\n` +
  `  rows <- lapply(res$results$bindings, function(b) {\n` +
  `    setNames(lapply(vars, function(v) if (!is.null(b[[v]])) b[[v]]$value else NA_character_), vars)\n` +
  `  })\n` +
  `  if (length(rows) == 0) return(as.data.frame(setNames(replicate(length(vars), character(0), simplify = FALSE), vars)))\n` +
  `  do.call(rbind.data.frame, c(rows, stringsAsFactors = FALSE))\n` +
  `}`;

const SPARQL_ASK_HELPER =
  `sparql_ask <- function(endpoint, query) {\n` +
  `  resp <- httr::GET(endpoint, query = list(query = query), httr::accept("application/sparql-results+json"))\n` +
  `  httr::stop_for_status(resp)\n` +
  `  isTRUE(jsonlite::fromJSON(httr::content(resp, as = "text", encoding = "UTF-8"))$boolean)\n` +
  `}`;

function disclaimerBlock(pageOut, packages) {
  const install = `install.packages(c(${packages.map((p) => `"${p}"`).join(', ')}))`;
  return (
    `::: {.callout-note}\n` +
    `This document is generated from [an interactive tutorial page](${SITE_URL}${pageOut}) on the ` +
    'SIB SPARQL training site. Some of the text below refers to page elements that don\'t exist here ' +
    '(a "Run query" button, "Visualize as graph", editable boxes) - here, Quarto runs the code chunks in ' +
    `order instead. Requires the R package${packages.length > 1 ? 's' : ''} ` +
    `${packages.map((p) => `\`${p}\``).join(', ')} - install once with \`${install}\`.\n` +
    `:::\n`
  );
}

function rChunk(label, text) {
  return `\`\`\`{r}\n#| label: ${label}\n${text}\n\`\`\`\n`;
}

function setupChunk(needs) {
  const lines = [];
  if (needs.fixture) lines.push('library(rdflib)');
  if (needs.live) {
    lines.push('library(httr)');
    lines.push('library(jsonlite)');
  }
  if (needs.fixtureAsk) {
    lines.push('');
    lines.push(RDF_ASK_HELPER);
  }
  if (needs.live) {
    lines.push('');
    lines.push(SPARQL_SELECT_HELPER);
  }
  if (needs.liveAsk) {
    lines.push('');
    lines.push(SPARQL_ASK_HELPER);
  }
  return rChunk('setup', lines.join('\n'));
}

function buildBody(markdown, upPrefix, pageOut) {
  const segments = parseMarkdownSegments(markdown);
  const needs = {
    fixture: segments.some((s) => s.type === 'fence' && s.lang === 'turtle' && s.attrs.fixture),
    fixtureAsk: segments.some(
      (s) => s.type === 'fence' && s.lang === 'sparql' && s.attrs.fixture && isAskQuery(s.content)
    ),
    live: segments.some((s) => s.type === 'fence' && s.lang === 'sparql' && s.attrs.live),
    liveAsk: segments.some(
      (s) => s.type === 'fence' && s.lang === 'sparql' && s.attrs.live && isAskQuery(s.content)
    ),
  };
  const packages = [];
  if (needs.fixture) packages.push('rdflib');
  if (needs.live) packages.push('httr', 'jsonlite');

  const parts = [disclaimerBlock(pageOut, packages), setupChunk(needs)];
  const fixtureVar = new Map();
  let chunkIndex = 0;

  for (const seg of segments) {
    if (seg.type === 'prose') {
      parts.push(rewriteRelativeLinks(seg.text, upPrefix));
      continue;
    }

    const { lang, attrs, content } = seg;
    chunkIndex += 1;

    if (lang === 'turtle' && attrs.fixture) {
      const varName = rIdent(attrs.fixture);
      fixtureVar.set(attrs.fixture, varName);
      parts.push(
        rChunk(
          `fixture-${chunkIndex}`,
          `${varName} <- rdf_parse("\n${rQuoted(content)}\n", format = "turtle")\n` +
            `cat(nrow(rdf_query(${varName}, "SELECT * WHERE { ?s ?p ?o }")), "triples loaded\\n")`
        )
      );
      continue;
    }

    if (lang === 'sparql' && attrs.fixture) {
      const varName = fixtureVar.get(attrs.fixture) || rIdent(attrs.fixture);
      const body = isAskQuery(content)
        ? `result <- rdf_ask(${varName}, "\n${rQuoted(content)}\n")\ncat("ASK result:", result, "\\n")`
        : `result <- rdf_query(${varName}, "\n${rQuoted(content)}\n")\nprint(result)`;
      parts.push(rChunk(`query-${chunkIndex}`, body));
      continue;
    }

    if (lang === 'sparql' && attrs.live) {
      const body = isAskQuery(content)
        ? `result <- sparql_ask("${attrs.live}", "\n${rQuoted(content)}\n")\ncat("ASK result:", result, "\\n")`
        : `result <- sparql_select("${attrs.live}", "\n${rQuoted(content)}\n")\nprint(result)`;
      parts.push(rChunk(`live-${chunkIndex}`, body));
      continue;
    }

    if (lang === 'sparql' && attrs.reference) {
      parts.push(`**Reference only - not executed here:** ${attrs.reference}\n\n\`\`\`sparql\n${content}\n\`\`\`\n`);
      continue;
    }

    // Any other fence (e.g. a plain, non-runnable reference block) -> inert markdown.
    parts.push(`\`\`\`${lang}\n${content}\n\`\`\`\n`);
  }

  return parts.join('\n\n');
}

/**
 * @param {Array<{src: string, out: string, title: string}>} pages
 * @param {string} rootDir  repo root (markdown sources live under here)
 * @param {string} outDir   built site root (`_site`)
 * @returns {Map<string, string|null>} page.out -> Quarto document path
 *   relative to outDir (e.g. "quarto/uniprot-01_basic_information.qmd"), or
 *   null if that page has no runnable examples and got no document.
 */
export function exportQuarto(pages, rootDir, outDir) {
  const quartoDir = path.join(outDir, 'quarto');
  mkdirSync(quartoDir, { recursive: true });

  const quartoFor = new Map();

  for (const page of pages) {
    const markdown = readFileSync(path.join(rootDir, page.src), 'utf8');
    const segments = parseMarkdownSegments(markdown);
    const hasFixtures = segments.some((s) => s.type === 'fence' && (s.attrs.fixture || s.attrs.live));

    if (!hasFixtures) {
      quartoFor.set(page.out, null);
      continue;
    }

    const pageDir = path.dirname(page.out); // '.' for a root-level page
    const upPrefix = pageDir === '.' ? '../' : `../${pageDir}/`;
    const slug = `${page.out.replace(/\.html$/, '').replace(/\//g, '-')}.qmd`;

    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : page.title;

    const doc = frontmatter(title) + '\n' + buildBody(markdown, upPrefix, page.out);
    writeFileSync(path.join(quartoDir, slug), doc);
    quartoFor.set(page.out, `quarto/${slug}`);
    console.log('wrote quarto doc', slug);
  }

  return quartoFor;
}
