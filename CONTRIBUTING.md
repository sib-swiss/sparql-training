# Contributing

This repo is plain Markdown, built into a static site by `site/build.mjs`. This
page explains that structure: how a page's Markdown turns into an interactive,
in-browser-runnable tutorial, and every place you need to register a new page
or a new kind of example so the build, the query verifier, and the Jupyter
notebook export all agree on it.

## Repository layout

- `index.md` &mdash; the home page.
- `basic/` &mdash; the "SPARQL basics" tutorial (`tutorial.md`), plus the plain
  Turtle files behind its example dataset (`ontology.ttl`, `resource.ttl`) and
  its SHACL shape (`shapes.ttl`). See `basic/README.md`.
- `UniProt/` &mdash; one file per topic (`00_introduction.md`,
  `01_basic_information.md`, ...), each a self-contained mini tutorial built
  from queries in [sparql-examples](https://github.com/sib-swiss/sparql-examples).
- `Rhea/rhea.md` &mdash; the metabolism/federated-query tutorial.
- `site/` &mdash; everything that turns the Markdown above into `_site/`
  (details below).
- `TODO.md` &mdash; a plain checkbox task list (`[]` / `[x]`); when a task
  needs more than one line, indent the continuation under it, same as the
  existing entries.

Also see `CLAUDE.md` for house style (simple language, terse commit messages)
if you're an AI agent working in this repo.

## The fence-block conventions

A tutorial page is Markdown, with SPARQL/Turtle examples written as fenced
code blocks carrying `key=value` attributes on the opening fence line (values
with spaces need quotes: `key="some value"`). These attributes are parsed
once, identically, by `site/lib/blocks.mjs` and consumed by the build, the
verifier, and the notebook exporter, so all three agree on one syntax. There
is no schema to update elsewhere for these &mdash; just write the fence.

### `` ```turtle fixture=<id> [title="..."] ``

An editable, in-page RDF dataset. Rendered as a collapsible box with the raw
Turtle (editable, click-to-reset), and a **Visualize as graph** button that
draws it as a force-directed graph in the browser. `<id>` is an arbitrary
short identifier local to that page &mdash; every `sparql fixture=<id>` block
using the same id queries this dataset.

### `` ```sparql fixture=<id> ``

A query that runs, live in the browser (via [Comunica](https://comunica.dev/)),
against the `turtle fixture=<id>` dataset with the same id on that page. Has
**Run query** and **Reset query** buttons. This is what `npm run verify`
actually executes (see below) &mdash; it must return at least one row (or,
for an `ASK` query, just needs to evaluate) or verification fails. A query
that's intentionally an unsolved exercise (contains a `***` placeholder) is
skipped by the verifier rather than treated as a failure.

### `` ```sparql live="<endpoint>" ``

A query with no local fixture, run live against a real public SPARQL
endpoint. Used when the point of the example *is* querying the real service.
Also executed by `npm run verify`, over the network, against the real
endpoint &mdash; expect it to be slower and occasionally flaky for reasons
outside this repo's control.

### `` ```sparql reference="..." ``

A query shown as reference material only &mdash; never executed on the page
or by the verifier. Use this for queries that are real but that a small
in-browser fixture or engine can't honestly represent: heavy federated
queries across multiple live endpoints, queries that only make sense against
the full production dataset, or ones hitting a non-standard SPARQL extension
(e.g. IDSM/Sachem's `sachem:similaritySearch`) that this site's engine
doesn't reliably support. The `reference="..."` text is shown to the reader
as a one-line explanation of what it is / where to run it for real.

### `` ```note type=comunica-limitation ``

A short callout, styled distinctly (Comunica's brand color and icon) from ordinary prose, for the specific case where an example doesn't run in-page *because of a genuine limitation in this site's own Comunica engine* &mdash; not because the underlying query or service is somehow at fault. Content is plain inline Markdown (links, `code`, `**bold**` all work). Use this only for that specific "it's Comunica, not the query" case; the more common "this needs the full production dataset" or "this needs a live/federated service a toy fixture can't stand in for" case is a plain prose paragraph next to a `reference="..."` or `live="..."` block instead, same as everywhere else on this site.

### `` ```turtle shapes=<id> [title="..."] ``

A SHACL shapes graph (see `basic/shapes.ttl`). Rendered like a data fixture,
but with a **Visualize shape diagram** button instead of a data-graph one
(shapes, target classes and datatypes as nodes; `sh:node`/`sh:property` as
edges). Not queried by `sparql fixture=` blocks and not executed by the
verifier &mdash; it's diagram-only, reference material for what "valid data"
means for the dataset shown alongside it.

## Adding a new page

1. Write the Markdown file wherever it belongs (existing directory, or a new
   top-level one if it's a genuinely new section &mdash; follow the
   `basic/README.md` + tutorial-file pattern if so).
2. Register it in **`site/build.mjs`**'s `PAGES` array: just `src` (the
   Markdown path), `title` (nav label), and optionally `group` (pages sharing
   a `group` collapse into one nav dropdown, in the order they first appear
   in `PAGES`). The built HTML path (`out`) is derived from `src`
   automatically (swap `.md` for `.html`); only set it explicitly if a page
   genuinely needs a different one. **`PAGES` order is nav order** &mdash;
   put a prerequisite page before the pages that assume it.
3. That's it &mdash; `site/verify-examples.mjs` and `site/export-notebooks.mjs`
   both run automatically over this same `PAGES` list (via `import { PAGES }
   from './build.mjs'`), so there's no second list to keep in sync. A page
   with no `fixture=`/`live=` blocks (a pure-prose intro, or one with only
   `reference=` blocks) is harmless to include in both: the verifier finds
   nothing to run, and the notebook exporter silently gives it no notebook
   link, which is correct, not a bug to fix.
4. A page can ship a sibling `assets/` folder (images etc.) referenced with a
   relative path from its Markdown (see `basic/assets/`) &mdash; the build
   copies it next to the built page automatically; no registration needed.

## Adding a new *kind* of fence block

The conventions above are all you need for an ordinary tutorial page.
If you need a genuinely new interactive block type (not just a new page using
the existing ones), you're extending the renderer itself:

1. Add a case for it in `buildMarkdownRenderer()`'s `md.renderer.rules.fence`
   override in **`site/build.mjs`** &mdash; this is what turns the fence into
   HTML (typically a `<details>`/`<div>` with `data-*` attributes the
   client-side runner reads).
2. Add the matching client-side behavior in
   **`site/assets/js/sparql-runner.js`** (parses the `data-*` attributes,
   wires up buttons, does the actual work &mdash; e.g. `initShaclFixtures()`
   for `shapes=`).
3. Decide whether **`site/verify-examples.mjs`** should execute it (only
   makes sense for something that produces a checkable SPARQL result) and
   whether **`site/export-notebooks.mjs`** should render it into a notebook
   cell (its default for an unrecognized fence type is to fall through to an
   inert Markdown code block, which is a safe, correct default if the new
   block type isn't something a static notebook can meaningfully reproduce).

## Building and checking your changes

```sh
npm install
npm run build    # builds the site into _site/
npm run verify   # runs every fixture=/live= example through Comunica; must pass before you're done
npm run serve    # serves _site/ locally so you can look at it in a browser
```

Run `npm run build && npm run verify` after any content change, not just
code changes &mdash; a typo in a fence attribute (e.g. a `fixture=` id that
doesn't match between the data block and the query block) is a silent no-op
in the renderer but a hard failure in the verifier, so the verifier is what
actually catches it.
