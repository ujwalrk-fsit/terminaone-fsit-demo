// Scans shipped source (src/) for legacy marketplace names.
// Docs (README), package meta, and this script itself are excluded by design.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, '..', 'src');
const selfFile = fileURLToPath(import.meta.url);
// Pattern for the retired vault/50 naming (kept only in this gate, never in src).
const forbidden = [/vent\s*ure\s*50/i, /vent\s*ure\s*vault/i, /vent\s*ure[-_]?50/i, /vent\s*ure[-_]?vault/i];
const exts = new Set(['.ts', '.tsx', '.css', '.html', '.json']);

let hits = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p);
    else if (exts.has(extname(e)) && resolve(p) !== resolve(selfFile)) {
      const s = readFileSync(p, 'utf8');
      for (const re of forbidden) {
        if (re.test(s)) { hits.push(`${p} :: ${re}`); break; }
      }
    }
  }
}
walk(srcRoot);
if (hits.length) {
  console.error('FORBIDDEN STRINGS FOUND:\n' + hits.join('\n'));
  process.exit(1);
} else {
  console.log('forbidden-string check passed (src clean)');
}
