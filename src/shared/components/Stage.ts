export function createStage(): { root: HTMLElement; body: HTMLElement } {
  const root = document.createElement('div');
  root.className = 'stage';
  const body = document.createElement('div');
  body.className = 'stage__body';
  root.appendChild(body);
  return { root, body };
}
