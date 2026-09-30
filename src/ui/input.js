// Pointer handling: one entry per active pointer (multi-touch), so ON + another key works.
export function attachInput(view, { onDown, onUp }) {
  const svg = view.svg;
  const active = new Map();   // pointerId -> key code
  const stop = e => e.preventDefault();
  for (const t of ['touchstart', 'touchmove', 'gesturestart', 'gesturechange', 'dblclick', 'contextmenu', 'selectstart', 'dragstart'])
    document.addEventListener(t, stop, { passive: false });

  svg.addEventListener('pointerdown', e => {
    e.preventDefault();
    const code = view.keyAt(e.clientX, e.clientY);
    if (code == null) return;
    active.set(e.pointerId, code);
    view.setPressed(code, true);
    onDown(code, e);
  });
  const end = e => {
    if (!active.has(e.pointerId)) return;
    const code = active.get(e.pointerId);
    active.delete(e.pointerId);
    view.setPressed(code, false);
    onUp(code, e);
  };
  // Listen on window so a pointer that slid off the key (or the SVG) still releases.
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
}
