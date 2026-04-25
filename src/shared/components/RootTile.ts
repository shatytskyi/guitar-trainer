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

  const nameDiv = document.createElement('div');
  nameDiv.className = 'root-tile__name';
  nameDiv.textContent = opts.root;

  const typesDiv = document.createElement('div');
  typesDiv.className = 'root-tile__types';
  typesDiv.textContent = opts.typeLabels.join(' · ');

  btn.append(nameDiv, typesDiv);
  btn.addEventListener('click', opts.onClick);
  return btn;
}
