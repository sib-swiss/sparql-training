// Shared markdown fence-block parsing, used by the site build, the example
// verifier, and the Jupyter notebook exporter, so all three agree on exactly
// one syntax for `turtle fixture=...` / `sparql fixture=...` / `sparql
// reference="..."` blocks.

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
  const lines = markdown.split('\n');
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
