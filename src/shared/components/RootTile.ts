export interface RootTileOptions {
  root: string;
  active: boolean;
  tabIndex: number;
  onClick: () => void;
}

export function createRootTile(opts: RootTileOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'root-tile' + (opts.active ? ' root-tile--active' : '');
  btn.dataset['root'] = opts.root;
  btn.tabIndex = opts.tabIndex;
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-selected', String(opts.active));
  btn.setAttribute('aria-controls', 'browse-stage-panel');

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

  btn.appendChild(nameDiv);
  btn.addEventListener('click', opts.onClick);
  return btn;
}
