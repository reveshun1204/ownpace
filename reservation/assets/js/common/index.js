import { initHeader } from "./header.js";
import { site } from "../config/site.js";
import { initNavigation } from "./navigation.js";
import { initMotion } from "./motion.js";
import { initCta } from "./cta.js";
export function initCommon() {
  initHeader();
  initMotion();
  initNavigation();
  initCta();
  document.documentElement.classList.add("motion-ready");
  if (site.logoUrl)
    document.querySelectorAll("[data-brand]").forEach((el) => {
      const img = new Image();
      img.alt = site.name;
      img.src = site.logoUrl;
      img.addEventListener("load", () => el.replaceChildren(img), {
        once: true,
      });
    });
}
