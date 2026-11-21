export function initMotion() {
  const root = document.documentElement;
  const button = document.getElementById("motion-toggle");
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = preference.matches;
  function apply() {
    root.classList.toggle("motion-off", paused);
    button.textContent = paused ? "MOTION OFF" : "MOTION ON";
    button.setAttribute("aria-pressed", String(paused));
    button.setAttribute(
      "aria-label",
      paused ? "アニメーションを再生" : "アニメーションを停止",
    );
    dispatchEvent(
      new CustomEvent("ownpace:motionchange", { detail: { paused } }),
    );
  }
  button.hidden = false;
  apply();
  button.addEventListener("click", () => {
    paused = !paused;
    apply();
  });
  if (preference.addEventListener)
    preference.addEventListener("change", (e) => {
      paused = e.matches;
      apply();
    });
  else
    preference.addListener((e) => {
      paused = e.matches;
      apply();
    });
}
