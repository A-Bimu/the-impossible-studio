/* Zawadi screen explorer: progressive enhancement of the existing 28-screen study.
   Original screen markup and visual assets remain the source of truth. */
(() => {
  const gallery = document.querySelector('#screenstart.gallery');
  if (!gallery || typeof HTMLDialogElement === 'undefined' ||
      typeof HTMLDialogElement.prototype.showModal !== 'function') return;

  const cards = Array.from(gallery.querySelectorAll(':scope > .screencard'));
  if (!cards.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'zawadi-viewer';
  dialog.setAttribute('aria-labelledby', 'zawadi-viewer-title');
  dialog.innerHTML = `
    <div class="zawadi-viewer__inner">
      <div class="zawadi-viewer__head">
        <div>
          <p class="zawadi-viewer__eyebrow">ZAWADI / SCREEN EXPLORER</p>
          <h2 id="zawadi-viewer-title"></h2>
        </div>
        <button type="button" class="zawadi-viewer__close" aria-label="Close screen explorer">Close ×</button>
      </div>
      <p class="zawadi-viewer__description"></p>
      <div class="zawadi-viewer__screen"></div>
      <div class="zawadi-viewer__actions">
        <button type="button" class="zawadi-viewer__previous">← Previous</button>
        <span class="zawadi-viewer__count" role="status" aria-live="polite" aria-atomic="true"></span>
        <button type="button" class="zawadi-viewer__next">Next →</button>
      </div>
      <p class="zawadi-viewer__hint">Use the left and right arrow keys to explore. Escape closes this view.</p>
    </div>`;
  document.body.append(dialog);

  const title = dialog.querySelector('#zawadi-viewer-title');
  const description = dialog.querySelector('.zawadi-viewer__description');
  const screen = dialog.querySelector('.zawadi-viewer__screen');
  const count = dialog.querySelector('.zawadi-viewer__count');
  const previous = dialog.querySelector('.zawadi-viewer__previous');
  const next = dialog.querySelector('.zawadi-viewer__next');
  const close = dialog.querySelector('.zawadi-viewer__close');
  let current = 0;
  let opener = null;

  function display(index) {
    if (index < 0 || index >= cards.length) return;
    const card = cards[index];
    const device = card.querySelector('.device');
    if (!device) return;
    current = index;
    title.textContent = card.querySelector('.screen-caption h3')?.textContent?.trim() || 'App screen';
    description.textContent = card.querySelector('.screen-caption p')?.textContent?.trim() || '';
    const copy = device.cloneNode(true);
    // The source gallery retains its anchor IDs; the modal must not duplicate them.
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    screen.replaceChildren(copy);
    count.textContent = `Screen ${current + 1} of ${cards.length}`;
    const wasPrevious = document.activeElement === previous;
    const wasNext = document.activeElement === next;
    previous.disabled = current === 0;
    next.disabled = current === cards.length - 1;
    if (wasPrevious && previous.disabled) next.focus();
    if (wasNext && next.disabled) previous.focus();
  }

  cards.forEach((card, index) => {
    const heading = card.querySelector('.screen-caption h3');
    const device = card.querySelector('.device');
    if (!heading || !device) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'zawadi-inspect';
    button.textContent = 'View screen ↗';
    button.setAttribute('aria-label', `Inspect ${heading.textContent.trim()} screen`);
    button.addEventListener('click', () => {
      opener = button;
      display(index);
      dialog.showModal();
      close.focus();
    });
    card.append(button);
  });

  previous.addEventListener('click', () => display(current - 1));
  next.addEventListener('click', () => display(current + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      display(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus();
  });
})();
