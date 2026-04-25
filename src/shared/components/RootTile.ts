export interface RootTileOptions {
  root: string;
  typeLabels: readonly string[];
  active: boolean;
  onClick: () => void;
}

export function createRootTile(opts: RootTileOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'root-tile' + (opts.active ? ' root-tile--active' : '');
  if (opts.active) btn.setAttribute('aria-pressed', 'true');

  const nameDiv = document.createElement('div');
  nameDiv.className = 'root-tile__name';
  const letter = opts.root[0] ?? '';
  const isSharp = opts.root.includes('#');
  nameDiv.append(document.createTextNode(letter));
  if (isSharp) {
    const em = document.createElement('em');
    em.textContent = '♯';
    nameDiv.appendChild(em);
  }

  const typesDiv = document.createElement('div');
  typesDiv.className = 'root-tile__types';
  typesDiv.textContent = opts.typeLabels.join(' · ');

  btn.append(nameDiv, typesDiv);
  btn.addEventListener('click', opts.onClick);
  return btn;
}
