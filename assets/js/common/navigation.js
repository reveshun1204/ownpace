import { revealNow } from "./reveal.js";
export function initNavigation() {
  const dialog = document.getElementById("site-nav");
  const open = document.getElementById("menu-open");
  const close = document.getElementById("menu-close");
  for(const [button,label] of [[open,'メニューを開く'],[close,'メニューを閉じる']]){
    const icon=document.createElement('span');icon.className='menu-icon';icon.setAttribute('aria-hidden','true');icon.append(document.createElement('span'));
    button.replaceChildren(icon);button.setAttribute('aria-label',label);
  }
  if (typeof dialog.showModal === "function") {
    open.hidden = false;
    open.addEventListener("click", () => {
      dialog.showModal();
      document.body.classList.add("menu-lock");
      open.setAttribute("aria-expanded", "true");
    });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      document.body.classList.remove("menu-lock");
      open.setAttribute("aria-expanded", "false");
    });
  }
  function navigate(target) {
    revealNow(target);
    const request = { id: target.id, handled: false };
    window.dispatchEvent(
      new CustomEvent("ownpace:story-request", { detail: request }),
    );
    if (!request.handled) {
      const paused = document.documentElement.classList.contains("motion-off");
      target.scrollIntoView({
        behavior: paused ? "instant" : "smooth",
        block: "start",
      });
      if (!target.hasAttribute("tabindex"))
        target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (event) => {
      const target = document.getElementById(a.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      if (dialog.open) {
        dialog.addEventListener("close", () => navigate(target), {
          once: true,
        });
        dialog.close();
      } else navigate(target);
    }),
  );
  document.querySelectorAll("[data-top]").forEach((button) =>
    button.addEventListener("click", () => {
      scrollTo({
        top: 0,
        behavior: document.documentElement.classList.contains("motion-off")
          ? "instant"
          : "smooth",
      });
      document
        .querySelector(".site-header .brand")
        .focus({ preventScroll: true });
    }),
  );
}
