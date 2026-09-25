// Parses every `turtle fixture=X` / `sparql fixture=X` pair out of the training
// markdown and actually runs it through Comunica, the same way the in-browser
// runner does. Catches broken fixtures/queries (and zero-result examples) before
// they ship. Run with `npm run verify`.
//
// Uses the full query-sparql engine (see site/src/comunica-entry.js for why),
// so examples using SERVICE make real network calls to live public endpoints
// during verification -- that's intentional: it's the only way to actually
// verify a federated example works, not just that it parses.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QueryEngine } from '@comunica/query-sparql';
import { Parser, Store } from 'n3';
import { parseMarkdownSegments, isAskQuery } from './lib/blocks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const FILES = [
  'default/tutorial.md',
  'uniprot/00_introduction.md',
  'uniprot/01_basic_information.md',
  'uniprot/02_protein_name.md',
  'uniprot/03_replicon_gene.md',
  'uniprot/04_taxonomy.md',
  'uniprot/14_chemistry.md',
  'rhea/SWAT4HCLS_2019/rhea_tutorial_SWAT4HCLS_2019.md',
];

function extractBlocks(markdown) {
  return parseMarkdownSegments(markdown)
    .filter((s) => s.type === 'fence' && (s.lang === 'turtle' || s.lang === 'sparql'))
    .map(({ lang, attrs, content }) => ({ lang, attrs, content }));
}

// See site/assets/js/sparql-runner.js's extractServiceUris/buildQueryContext
// for why: pre-registering SERVICE targets as `{ type: 'sparql', value }`
// sources avoids a broken endpoint-discovery probe some real endpoints
// (e.g. IDSM/Sachem) fail on, and `lenient: true` keeps the query going even
// if that same source also gets (harmlessly) probed for the rest of the query.
function extractServiceUris(query) {
  const uris = [];
  const seen = new Set();
  const re = /SERVICE\s+(?:SILENT\s+)?<([^>]+)>/gi;
  let m;
  while ((m = re.exec(query))) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      uris.push(m[1]);
    }
  }
  return uris;
}

function buildQueryContext(query, store) {
  const sources = [store, ...extractServiceUris(query).map((value) => ({ type: 'sparql', value }))];
  return { sources, lenient: true };
}

let totalOk = 0;
let totalFail = 0;

for (const file of FILES) {
  const markdown = readFileSync(path.join(ROOT, file), 'utf8');
  const blocks = extractBlocks(markdown);
  const stores = {};

  console.log(`\n=== ${file} ===`);

  for (const block of blocks) {
    if (block.lang === 'turtle' && block.attrs.fixture) {
      const id = block.attrs.fixture;
      try {
        const store = new Store();
        const parser = new Parser({ baseIRI: 'https://sparql-training.example/' });
        store.addQuads(parser.parse(block.content));
        stores[id] = store;
        console.log(`  [fixture ${id}] OK (${store.size} quads)`);
      } catch (err) {
        console.log(`  [fixture ${id}] PARSE ERROR: ${err.message}`);
        totalFail++;
      }
    }
  }

  const engine = new QueryEngine();
  for (const block of blocks) {
    if (block.lang === 'sparql' && block.attrs.fixture) {
      const id = block.attrs.fixture;
      const store = stores[id];
      if (!store) {
        console.log(`  [query -> ${id}] NO FIXTURE`);
        totalFail++;
        continue;
      }
      if (block.content.includes('***')) {
        console.log(`  [query -> ${id}] SKIPPED (unsolved exercise with *** blanks, expected to fail as written)`);
        continue;
      }
      try {
        const context = buildQueryContext(block.content, store);
        if (isAskQuery(block.content)) {
          const result = await engine.queryBoolean(block.content, context);
          console.log(`  [query -> ${id}] ASK OK -> ${result}`);
        } else {
          const stream = await engine.queryBindings(block.content, context);
          const bindings = await stream.toArray();
          console.log(`  [query -> ${id}] SELECT OK -> ${bindings.length} row(s)`);
          if (bindings.length === 0) {
            console.log('    !! WARNING: zero rows');
            totalFail++;
          }
        }
        totalOk++;
      } catch (err) {
        console.log(`  [query -> ${id}] QUERY ERROR: ${err.message}`);
        totalFail++;
      }
    } else if (block.lang === 'sparql' && block.attrs.reference) {
      console.log(`  [reference: ${block.attrs.reference.slice(0, 60)}] (not executed, by design)`);
    }
  }
}

console.log(`\n\nTOTAL: ${totalOk} ok, ${totalFail} failed`);
if (totalFail > 0) process.exit(1);
