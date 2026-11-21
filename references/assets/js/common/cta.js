import { site } from "../config/site.js";
export function initCta() {
  const dialog = document.getElementById("join-dialog");
  const close = document.getElementById("join-close");
  close.addEventListener("click", () => dialog.close());
  const target = site.bookingUrl || site.lineUrl;
  document.querySelectorAll("[data-join]").forEach((control) => {
    control.addEventListener("click", () => {
      if (target) window.location.assign(target);
      else if (typeof dialog.showModal === "function") dialog.showModal();
      else
        window.alert(
          "公式LINEのトーク画面から「参加予約」を開いてお申し込みください。",
        );
    });
  });
  document.addEventListener("click", (event) => {
    const control = event.target.closest("[data-cta], [data-join]");
    if (!control) return;
    const detail = {
      event: "ownpace_cta",
      cta_name: control.dataset.cta || "join",
      page: location.pathname,
    };
    document.dispatchEvent(new CustomEvent("ownpace:cta", { detail }));
    if (site.analyticsEnabled) {
      window.dataLayer ||= [];
      window.dataLayer.push(detail);
    }
  });
}
