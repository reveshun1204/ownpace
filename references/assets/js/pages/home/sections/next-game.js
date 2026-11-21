import { site } from "../../../config/site.js";
import { initSection } from "../../../common/reveal.js";
export default function init() {
  initSection("next-game");
  const card = document.getElementById("next-game-card");
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(new Date());
  const now = Date.now();
  const next = [...site.games]
    .filter(
      (game) =>
        game.date >= today &&
        Date.parse(`${game.date}T${game.end}:00+09:00`) > now,
    )
    .sort((a, b) =>
      `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`),
    )[0];
  if (!next) {
    const p = document.createElement("p");
    p.className = "game-empty";
    p.textContent =
      "次回の開催案内は準備中です。スケジュールと公式LINEをご確認ください。";
    card.replaceChildren(p);
    const a = document.createElement("a");
    a.href = "schedule.html";
    a.className = "button button--solid";
    a.textContent = "開催日程を見る";
    a.dataset.cta = "schedule";
    card.append(a);
    return;
  }
  const [year, month, day] = next.date.split("-").map(Number);
  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
    new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  ];
  const date = card.querySelector(".game-date");
  date.replaceChildren(
    document.createTextNode(
      `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`,
    ),
  );
  const small = document.createElement("small");
  small.textContent = weekday;
  date.append(small);
  card.querySelector(".game-time").textContent = `${next.start} — ${next.end}`;
  card.querySelector(".game-venue").textContent = next.venue;
  card.querySelector(".game-court").textContent = next.court;
  const values = card.querySelectorAll(".game-meta dd");
  values[0].textContent = `${next.fee}円`;
  values[1].textContent = `${next.capacity}名`;
  values[2].textContent = Number.isInteger(next.remaining)
    ? `${next.remaining}名`
    : "確認準備中";
  card.querySelector(".game-status").textContent = next.bookingOpen
    ? "参加予約の案内を公式LINEでご確認ください。"
    : "予約受付の案内は準備中です。";
}
