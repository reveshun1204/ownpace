import { site } from "../../../config/site.js";
export default function init() {
  const frame = document.getElementById("ownpace-calendar");
  const outside = document.getElementById("open-calendar");
  const buttons = [...document.querySelectorAll("[data-view]")];
  function show(mode) {
    if (!["MONTH", "AGENDA"].includes(mode)) return;
    const url = new URL(frame.src);
    url.searchParams.set("src", site.calendarId);
    url.searchParams.set("ctz", "Asia/Tokyo");
    url.searchParams.set("mode", mode);
    if (frame.src !== url.href) frame.src = url.href;
    frame.title = `OWN PACE 開催カレンダー（${mode === "MONTH" ? "月表示" : "予定一覧"}・日本時間）`;
    outside.href = url.href;
    buttons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.view === mode)),
    );
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => show(button.dataset.view)),
  );
  document.getElementById("view-switch").hidden = false;
  show("MONTH");
}
