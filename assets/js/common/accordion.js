// Interruptible height animation; ARIA, focusability and reduced motion stay in sync.
export function initAccordions(root = document) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  root.querySelectorAll(".faq-question").forEach((button) => {
    const answer = document.getElementById(button.getAttribute("aria-controls"));
    if (!answer || button.dataset.accordionReady) return;
    button.dataset.accordionReady = "true";
    let animation = null;
    let revision = 0;
    const wantsMotion = () => !reduced.matches && !document.documentElement.classList.contains("motion-off");
    const finish = (open) => {
      animation?.cancel(); animation = null;
      answer.style.height = "";
      answer.hidden = !open;
      answer.inert = !open;
      answer.setAttribute("aria-hidden", String(!open));
    };
    finish(button.getAttribute("aria-expanded") === "true");
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      const ticket = ++revision;
      const from = answer.hidden ? 0 : answer.getBoundingClientRect().height;
      animation?.cancel(); animation = null;
      button.setAttribute("aria-expanded", String(open));
      answer.hidden = false;
      answer.inert = !open;
      answer.setAttribute("aria-hidden", String(!open));
      answer.style.height = "auto";
      const to = open ? answer.scrollHeight : 0;
      if (!wantsMotion() || !answer.animate) { finish(open); return; }
      answer.style.height = `${from}px`;
      animation = answer.animate([{height:`${from}px`},{height:`${to}px`}], {
        duration:560, easing:"cubic-bezier(.22,.8,.22,1)", fill:"forwards"
      });
      animation.onfinish = () => { if(ticket === revision) finish(open); };
    });
    const settle = () => { if(animation) { revision++; finish(button.getAttribute("aria-expanded") === "true"); } };
    addEventListener("ownpace:motionchange", settle);
    reduced.addEventListener?.("change", settle);
    addEventListener("resize", settle);
  });
}
