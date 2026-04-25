// One-shot generator: pulls open-source guitar chord data from
// tombatossals/chords-db (MIT-licensed) and emits src/data/chords-all.ts
// containing curated shapes for the "all" set.
//
// Run:  node scripts/build-chords-all.mjs <path-to-guitar.json>
//
// The script is intentionally not part of the build — it produces a static
// .ts file that is then reviewed and committed. Re-run it only when we
// want to refresh the upstream snapshot.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT_KEY_TO_PC = {
  'C': 'C',
  'Csharp': 'C#',
  'D': 'D',
  'Eb': 'D#',
  'E': 'E',
  'F': 'F',
  'Fsharp': 'F#',
  'G': 'G',
  'Ab': 'G#',
  'A': 'A',
  'Bb': 'A#',
  'B': 'B',
};

const PC_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Map our internal chord type → chords-db suffix.
const TYPE_TO_SUFFIX = {
  '':     'major',
  'm':    'minor',
  '7':    '7',
  'maj7': 'maj7',
  'm7':   'm7',
  'sus2': 'sus2',
  'sus4': 'sus4',
  'add9': 'add9',
  'dim':  'dim',
  'aug':  'aug',
  '6':    '6',
  'm6':   'm6',
  'dim7': 'dim7',
  'm7b5': 'm7b5',
  '9':    '9',
  'm9':   'm9',
  'maj9': 'maj9',
  '13':   '13',
};

const TYPE_ORDER = [
  '', 'm', '7', 'maj7', 'm7', 'sus2', 'sus4', 'add9',
  'dim', 'aug', '6', 'm6', 'dim7', 'm7b5',
  '9', 'm9', 'maj9', '13',
];

// MIDI 0 = C-1 (Tone.js convention). C4 = 60.
const PC_BY_SEMI = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function midiToTone(m) {
  const pc = PC_BY_SEMI[m % 12];
  const oct = Math.floor(m / 12) - 1;
  return `${pc}${oct}`;
}

function convertPosition(pos) {
  const baseFret = pos.baseFret ?? 1;
  const frets = pos.frets.map(f => {
    if (f === -1) return null;
    if (f === 0) return 0;
    return f + baseFret - 1;
  });
  // chords-db semantics for fingers:
  //   - `-1` or `0` on a muted/open string ⇒ no finger
  //   - `0` on a fretted string when `barres` is non-empty ⇒ that string is
  //     covered by the barre finger; assume the lowest barre finger
  //     (typically the index, finger 1).
  const barreFinger = (pos.barres ?? []).length > 0 ? Math.min(...pos.barres) : null;
  const fingers = pos.fingers.map((fg, i) => {
    const fret = frets[i];
    if (fret === null || fret === 0) return null;
    if (fg === -1 || fg === 0) {
      return barreFinger ?? null;
    }
    return fg;
  });
  const notes = pos.midi.map(midiToTone);

  // A position is "open" if every fretted note sits at fret 1..3 with at
  // least one open string. Otherwise it's a barre / high-position shape.
  const fretted = frets.filter(f => typeof f === 'number' && f > 0);
  const hasOpen = frets.some(f => f === 0);
  const maxFret = fretted.length ? Math.max(...fretted) : 0;
  const isOpen = baseFret === 1 && hasOpen && maxFret <= 4 && (pos.barres?.length ?? 0) === 0;
  const label = isOpen ? 'open' : 'barre';

  return { label, frets, fingers, notes };
}

function shapeKey(shape) {
  return shape.frets.map(f => (f === null ? 'x' : String(f))).join(',');
}

function pickPositions(positions) {
  // Take up to 2 distinct shapes per (root, type), preferring the lowest
  // baseFret first. The DB lists positions roughly in this order already.
  const out = [];
  const seen = new Set();
  for (const pos of positions) {
    const shape = convertPosition(pos);
    const k = shapeKey(shape);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(shape);
    if (out.length >= 2) break;
  }
  return out;
}

function build(db) {
  const result = [];
  for (const pc of PC_ORDER) {
    const dbKey = Object.entries(ROOT_KEY_TO_PC).find(([, v]) => v === pc)?.[0];
    if (!dbKey) {
      console.warn(`No DB key for ${pc}`);
      continue;
    }
    const types = [];
    for (const type of TYPE_ORDER) {
      const suffix = TYPE_TO_SUFFIX[type];
      const entry = db.chords[dbKey]?.find(c => c.suffix === suffix);
      if (!entry) {
        console.warn(`Missing ${pc}${type} (db: ${dbKey} ${suffix})`);
        continue;
      }
      const shapes = pickPositions(entry.positions);
      if (shapes.length === 0) continue;
      types.push({ type, shapes });
    }
    if (types.length > 0) result.push({ root: pc, types });
  }
  return result;
}

function fmtFret(f) {
  return f === null ? 'null' : String(f);
}
function fmtFinger(fg) {
  return fg === null ? 'null' : String(fg);
}
function fmtArr(arr, fmt) {
  return `[${arr.map(fmt).join(', ')}]`;
}
function fmtNotes(notes) {
  return `[${notes.map(n => `'${n}'`).join(', ')}]`;
}

function emit(rootEntries) {
  const lines = [];
  lines.push('// AUTO-GENERATED from tombatossals/chords-db (MIT). Edit via');
  lines.push('// scripts/build-chords-all.mjs and a fresh upstream guitar.json.');
  lines.push("import type { RootEntry } from './types';");
  lines.push('');
  lines.push('export const CHORDS_ALL: readonly RootEntry[] = [');
  for (const r of rootEntries) {
    lines.push(`  { root: '${r.root}', types: [`);
    for (const t of r.types) {
      const typeLit = t.type === '' ? "''" : `'${t.type}'`;
      lines.push(`    { type: ${typeLit}, shapes: [`);
      for (const s of t.shapes) {
        lines.push(
          `      { label: '${s.label}', frets: ${fmtArr(s.frets, fmtFret)}, ` +
          `fingers: ${fmtArr(s.fingers, fmtFinger)}, notes: ${fmtNotes(s.notes)} },`,
        );
      }
      lines.push('    ] },');
    }
    lines.push('  ] },');
  }
  lines.push('];');
  return lines.join('\n') + '\n';
}

function main() {
  const argv = process.argv.slice(2);
  const dbPath = argv[0];
  if (!dbPath) {
    console.error('usage: node scripts/build-chords-all.mjs <guitar.json>');
    process.exit(1);
  }
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const built = build(db);
  const out = emit(built);
  const here = path.dirname(url.fileURLToPath(import.meta.url));
  const target = path.resolve(here, '..', 'src', 'data', 'chords-all.ts');
  fs.writeFileSync(target, out, 'utf8');
  const totalShapes = built.reduce((acc, r) => acc + r.types.reduce((a, t) => a + t.shapes.length, 0), 0);
  console.log(`Wrote ${target} — ${built.length} roots, ${totalShapes} shapes.`);
}

main();
