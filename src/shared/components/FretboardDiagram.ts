import type { ChordShape } from '../lib/chord';

const DIAGRAM = {
  width: 200,
  height: 240,
  paddingX: 30,
  paddingTop: 40,
  paddingBottom: 20,
  fingerDotRadius: 9,
  barreHeight: 18,
  maxFretInOpenPosition: 4,
};

export function renderFretboardDiagram(shape: ChordShape): string {
  const { width: W, height: H, paddingX: padX, paddingTop: padTop, paddingBottom: padBot,
          fingerDotRadius: dotR, barreHeight: barreH, maxFretInOpenPosition: maxOpen } = DIAGRAM;
  const fretboardW = W - padX * 2;
  const fretboardH = H - padTop - padBot;
  const stringSpacing = fretboardW / 5;
  const fretSpacing = fretboardH / 5;

  const playedFrets: number[] = [];
  for (const f of shape.frets) if (f != null && f > 0) playedFrets.push(f);
  const minFret = playedFrets.length ? Math.min(...playedFrets) : 1;
  const maxFret = playedFrets.length ? Math.max(...playedFrets) : 1;
  const fretOffset = maxFret > maxOpen ? minFret - 1 : 0;

  const parts: string[] = [];
  parts.push(`<svg class="fretboard-diagram" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`);

  for (let s = 0; s < 6; s++) {
    const x = padX + s * stringSpacing;
    const f = shape.frets[s];
    const y = padTop - 12;
    if (f === null) {
      parts.push(`<text x="${x}" y="${y}" text-anchor="middle" font-family="var(--font-mono)" font-size="14" fill="var(--ink-soft)" font-weight="600">×</text>`);
    } else if (f === 0) {
      parts.push(`<circle cx="${x}" cy="${y - 4}" r="5" fill="none" stroke="var(--ink)" stroke-width="1.5"/>`);
    }
  }

  if (fretOffset === 0) {
    parts.push(`<rect x="${padX - 1}" y="${padTop}" width="${fretboardW + 2}" height="4" fill="var(--ink)"/>`);
  } else {
    parts.push(`<text x="${padX - 10}" y="${padTop + fretSpacing / 2 + 4}" text-anchor="end" font-family="var(--font-mono)" font-size="11" fill="var(--ink-soft)" font-weight="600">${fretOffset + 1}fr</text>`);
  }

  for (let f = 0; f <= 5; f++) {
    const y = padTop + f * fretSpacing;
    parts.push(`<line x1="${padX}" y1="${y}" x2="${padX + fretboardW}" y2="${y}" stroke="var(--ink-soft)" stroke-width="1"/>`);
  }
  for (let s = 0; s < 6; s++) {
    const x = padX + s * stringSpacing;
    parts.push(`<line x1="${x}" y1="${padTop}" x2="${x}" y2="${padTop + fretboardH}" stroke="var(--ink)" stroke-width="1.2"/>`);
  }

  const barres: Record<string, { finger: number | null; fret: number; strings: number[] }> = {};
  for (let s = 0; s < 6; s++) {
    const finger = shape.fingers[s];
    const fret = shape.frets[s];
    if (finger != null && fret != null && fret > 0) {
      const key = `${finger}-${fret}`;
      const entry = barres[key] ?? { finger, fret, strings: [] };
      entry.strings.push(s);
      barres[key] = entry;
    }
  }

  Object.values(barres).forEach(b => {
    if (b.strings.length > 1) {
      const x1 = padX + Math.min(...b.strings) * stringSpacing;
      const x2 = padX + Math.max(...b.strings) * stringSpacing;
      const fretPos = b.fret - fretOffset;
      const y = padTop + (fretPos - 0.5) * fretSpacing;
      parts.push(`<rect x="${x1 - dotR}" y="${y - dotR}" width="${x2 - x1 + dotR * 2}" height="${barreH}" rx="${dotR}" fill="var(--ink)"/>`);
      if (b.finger != null) {
        const midX = (x1 + x2) / 2;
        parts.push(`<text x="${midX}" y="${y + 4}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="var(--on-accent)" font-weight="600">${b.finger}</text>`);
      }
    }
  });

  for (let s = 0; s < 6; s++) {
    const fret = shape.frets[s];
    const finger = shape.fingers[s];
    if (fret != null && fret > 0) {
      const fretPos = fret - fretOffset;
      const x = padX + s * stringSpacing;
      const y = padTop + (fretPos - 0.5) * fretSpacing;
      const key = `${finger}-${fret}`;
      const entry = barres[key];
      const isBarred = entry !== undefined && entry.strings.length > 1;
      if (!isBarred) {
        parts.push(`<circle cx="${x}" cy="${y}" r="${dotR}" fill="var(--ink)"/>`);
        if (finger != null) {
          parts.push(`<text x="${x}" y="${y + 4}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="var(--on-accent)" font-weight="600">${finger}</text>`);
        }
      }
    }
  }

  parts.push(`</svg>`);
  return parts.join('');
}
