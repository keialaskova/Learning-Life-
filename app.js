(() => {
  const fill = document.getElementById('progressFill');
  const track = document.getElementById('progressTrack');
  const number = document.getElementById('progressNumber');
  const label = document.getElementById('loadingLabel');
  const screen = document.querySelector('.loading-screen');

  // Demo loading cycle. Replace this with the app's real initialization progress later.
  const duration = 5200;
  const start = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished = false;

  function update(now) {
    const elapsed = now - start;
    const raw = Math.min(100, (elapsed / duration) * 100);
    // Ease gently, but keep the final 100% tied to completion of the loading cycle.
    const progress = raw === 100 ? 100 : Math.min(96, 100 * (1 - Math.pow(1 - raw / 100, 1.55)));
    const value = Math.round(progress);
    fill.style.width = `${progress}%`;
    number.textContent = `${value}%`;
    track.setAttribute('aria-valuenow', String(value));

    if (raw < 100) {
      requestAnimationFrame(update);
      return;
    }
    if (finished) return;
    finished = true;
    fill.style.width = '100%';
    number.textContent = '100%';
    track.setAttribute('aria-valuenow', '100');
    label.textContent = 'Ready to begin!';
    screen.classList.add('is-ready');
    window.dispatchEvent(new CustomEvent('learninglife:ready'));
  }

  if (reducedMotion) {
    fill.style.transition = 'none';
  }
  requestAnimationFrame(update);
})();
