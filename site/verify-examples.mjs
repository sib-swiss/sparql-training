// Parses every `turtle fixture=X` / `sparql fixture=X` pair out of the training
// markdown and actually runs it through Comunica, the same way the in-browser
// runner does. Catches broken fixtures/queries (and zero-result examples) before
// they ship. Run with `npm run verify`.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { QueryEngine } from '@comunica/query-sparql-rdfjs-lite';
import { Parser, Store } from 'n3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const FILES = [
  'default/tutorial.md',
  'uniprot/00_introduction.md',
  'uniprot/01_basic_information.md',
  'uniprot/02_protein_name.md',
  'uniprot/03_replicon_gene.md',
  'uniprot/04_taxonomy.md',
  'rhea/SWAT4HCLS_2019/rhea_tutorial_SWAT4HCLS_2019.md',
];

function extractBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^```(turtle|sparql)\s*(.*)$/);
    if (m) {
      const lang = m[1];
      const attrs = {};
      const re = /(\w[\w-]*)=("([^"]*)"|(\S+))/g;
      let am;
      while ((am = re.exec(m[2]))) {
        attrs[am[1]] = am[3] !== undefined ? am[3] : am[4];
      }
      const content = [];
      i++;
      while (i < lines.length && lines[i] !== '```') {
        content.push(lines[i]);
        i++;
      }
      blocks.push({ lang, attrs, content: content.join('\n') });
    }
    i++;
  }
  return blocks;
}

function isAskQuery(query) {
  const withoutComments = query.replace(/#[^\n]*/g, '');
  const withoutPrologue = withoutComments.replace(/^\s*(PREFIX|BASE)\b[^\n]*$/gim, '');
  return /^\s*ASK\b/i.test(withoutPrologue);
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
        if (isAskQuery(block.content)) {
          const result = await engine.queryBoolean(block.content, { sources: [store] });
          console.log(`  [query -> ${id}] ASK OK -> ${result}`);
        } else {
          const stream = await engine.queryBindings(block.content, { sources: [store] });
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
