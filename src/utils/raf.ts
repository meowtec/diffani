export function setRafInterval(callback: (delta: number) => void) {
  let rafId = -1;
  let now = performance.now();

  const cb = () => {
    const nextNow = performance.now();
    const delta = nextNow - now;
    callback(delta);
    now = nextNow;
    rafId = requestAnimationFrame(cb);
  };

  cb();

  const cancel = () => {
    cancelAnimationFrame(rafId);
  };

  return cancel;
}
