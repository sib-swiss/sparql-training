// `npm run watch`: rebuilds the site whenever a source file changes, and
// serves _site/ at the same time -- so editing a tutorial and reloading the
// browser is the whole workflow, no separate `npm run build` step.
//
// Uses plain `node --watch`, restarting `site/build.mjs` on any change under
// the paths below, rather than a file-watcher dependency. Deliberately does
// NOT watch the whole repo root: that would include `_site/` itself, and a
// build script that watches its own output directory rebuilds forever.
import { spawn } from 'node:child_process';

const WATCHED_PATHS = [
  'index.md',
  'basic',
  'UniProt',
  'Rhea',
  'intro',
  'site/build.mjs',
  'site/lib',
  'site/templates',
  'site/assets',
  'site/src',
  'site/export-notebooks.mjs',
];

const build = spawn(
  process.execPath,
  ['--watch', ...WATCHED_PATHS.map((p) => `--watch-path=${p}`), 'site/build.mjs'],
  { stdio: 'inherit' }
);

const serve = spawn('npx', ['--yes', 'serve', '_site'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  build.kill();
  serve.kill();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
build.on('exit', shutdown);
serve.on('exit', shutdown);
