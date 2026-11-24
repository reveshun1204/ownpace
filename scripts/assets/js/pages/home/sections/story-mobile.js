// Let Safari own the sticky positioning. JS only chooses the current scene.
export function initNativeStory({ root, scenes, activate }) {
  const stage = root.querySelector(".story-stage");
  const header = document.querySelector(".site-header");
  let frame = 0, resizeFrame = 0, lastWidth = innerWidth, step = 0, enabled = false, destroyed = false;
  root.classList.add("is-pinned", "is-native");
  function update() {
    frame = 0;
    if (!enabled) return;
    const travelled = header.offsetHeight - root.getBoundingClientRect().top;
    activate(Math.max(0, Math.min(scenes.length - 1, Math.floor(travelled / step))));
  }
  function measure() {
    root.classList.add("is-pinned", "is-native");
    root.classList.remove("is-compact");
    const height = stage.offsetHeight;
    const contentFits = () => scenes.every(scene => {
      const css = getComputedStyle(scene);
      const available = height - parseFloat(css.paddingTop) - parseFloat(css.paddingBottom);
      return scene.querySelector(".scene-text").offsetHeight <= available;
    });
    if (!contentFits()) root.classList.add("is-compact");
    enabled = contentFits();
    if (!enabled) {
      root.classList.remove("is-pinned", "is-native", "is-compact");
      root.style.removeProperty("height");
      scenes.forEach(scene => {scene.inert = false;scene.removeAttribute("aria-hidden");});
      return;
    }
    step = Math.max(280, height * .60);
    // Last scene receives a full readable interval before the stage is released.
    root.style.height = `${height + step * scenes.length}px`;
    update();
  }
  function onScroll() { if (!frame) frame = requestAnimationFrame(update); }
  function onResize() {
    // Browser toolbars change height during a swipe. They must not recreate the story.
    if (innerWidth === lastWidth) return;
    lastWidth = innerWidth;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(measure);
  }
  addEventListener("scroll", onScroll, {passive:true});
  addEventListener("resize", onResize, {passive:true});
  measure();
  document.fonts?.ready.then(() => { if(!destroyed && root.classList.contains("is-native")) measure(); });
  return {
    jump(id) {
      const i = scenes.findIndex(scene => scene.id === id);
      if (!enabled || i < 0) return false;
      const top = scrollY + root.getBoundingClientRect().top - header.offsetHeight + step * (i + .35);
      scrollTo({top,behavior:"instant"});
      activate(i);
      scenes[i].querySelector("h2").focus({preventScroll:true});
      return true;
    },
    destroy() {
      destroyed = true;
      removeEventListener("scroll",onScroll);removeEventListener("resize",onResize);
      cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);
      root.style.removeProperty("height");
      root.classList.remove("is-native","is-compact");
    }
  };
}
