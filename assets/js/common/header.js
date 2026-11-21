// Keep the phone header focused on its brand and menu, with full-size motion controls inside the menu.
export function initHeader() {
  const toggle = document.getElementById("motion-toggle");
  const desktop = document.querySelector(".header-controls");
  const menu = document.querySelector(".menu-shell");
  const phone = matchMedia("(max-width:720px)");
  if (!toggle || !desktop || !menu) return;
  const place = () => { (phone.matches ? menu : desktop).prepend(toggle); };
  place(); phone.addEventListener?.("change", place);
}
