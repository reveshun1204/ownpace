let observer;
export function revealNow(target) {
  if (!target) return;
  [target, ...target.querySelectorAll(".pending")].forEach((el) => {
    el.classList.remove("pending");
    observer?.unobserve(el);
  });
}
export function initSection(id) {
  const section = document.getElementById(id);
  if (!section || !("IntersectionObserver" in window)) return;
  observer ||= new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("pending");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.06 },
  );
  const elements = [...section.querySelectorAll(".reveal")];
  if (section.classList.contains("reveal")) elements.unshift(section);
  elements.forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight * 0.96) {
      el.classList.add("pending");
      observer.observe(el);
    }
  });
}
