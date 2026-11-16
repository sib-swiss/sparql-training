// Shared markdown fence-block parsing, used by the site build, the example
// verifier, and the Jupyter notebook exporter, so all three agree on exactly
// one syntax for `turtle fixture=...` / `sparql fixture=...` / `sparql
// reference="..."` blocks.
import { load as loadYaml } from 'js-yaml';

/**
 * Splits a page's optional leading `---\n...\n---\n` YAML block (the same
 * convention Jekyll and Quarto use) from the rest of the Markdown -- e.g.
 * the fields site/build.mjs's Bioschemas JSON-LD block needs (description,
 * keywords, teaches, ...), which don't belong in the rendered page prose.
 * A page with no such block gets `data: null` and `content` unchanged.
 */
export function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return { data: null, content: markdown };

  const end = markdown.indexOf('\n---\n', 4);
  if (end === -1) return { data: null, content: markdown };

  const data = loadYaml(markdown.slice(4, end + 1)) ?? {};
  return { data, content: markdown.slice(end + 5) };
}

/** Parses a fence info string like: sparql fixture=basic-entry title="A title" */
export function parseFenceAttrs(info) {
  const rest = info.trim().split(/\s+/).slice(1).join(' ');
  const attrs = {};
  const re = /(\w[\w-]*)=("([^"]*)"|(\S+))/g;
  let m;
  while ((m = re.exec(rest))) {
    attrs[m[1]] = m[3] !== undefined ? m[3] : m[4];
  }
  return attrs;
}

/**
 * Parses a markdown document into an ordered list of segments:
 *   { type: 'prose', text }
 *   { type: 'fence', lang, attrs, content }
 * Every fence (any language) becomes its own segment, in document order,
 * with the surrounding prose split around it.
 */
export function parseMarkdownSegments(markdown) {
  const { content } = parseFrontmatter(markdown);
  const lines = content.split('\n');
  const segments = [];
  let proseBuf = [];
  let i = 0;

  function flushProse() {
    const text = proseBuf.join('\n').trim();
    if (text) segments.push({ type: 'prose', text });
    proseBuf = [];
  }

  while (i < lines.length) {
    const m = lines[i].match(/^```(\S*)\s*(.*)$/);
    if (m) {
      flushProse();
      const lang = m[1];
      const attrs = parseFenceAttrs(`${lang} ${m[2]}`);
      const content = [];
      i++;
      while (i < lines.length && lines[i] !== '```') {
        content.push(lines[i]);
        i++;
      }
      segments.push({ type: 'fence', lang, attrs, content: content.join('\n') });
    } else {
      proseBuf.push(lines[i]);
    }
    i++;
  }
  flushProse();
  return segments;
}

export function isAskQuery(query) {
  const withoutComments = query.replace(/#[^\n]*/g, '');
  const withoutPrologue = withoutComments.replace(/^\s*(PREFIX|BASE)\b[^\n]*$/gim, '');
  return /^\s*ASK\b/i.test(withoutPrologue);
}
