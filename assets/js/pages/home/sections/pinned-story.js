import { initNativeStory } from "./story-mobile.js";
// One pinned stage, one timeline. Without GSAP or with reduced motion,
// every scene remains in normal document flow and all links stay accessible.
export default async function init() {
  const root = document.getElementById("pinned-story");
  if (!root) return;
  const scenes = [...root.querySelectorAll("[data-story-scene]")];
  const controls = [...root.querySelectorAll("[data-story-jump]")];
  let gsap,
    ScrollTrigger,
    match,
    timeline,
    trigger,
    mobileStory = null;
  let active = -1;
  function reset() {
    root.classList.remove("is-pinned", "is-native");
    mobileStory = null;
    scenes.forEach((scene) => {
      scene.classList.remove("is-active");
      scene.inert = false;
      scene.removeAttribute("aria-hidden");
    });
    timeline = null;
    trigger = null;
    active = -1;
    root.classList.remove("is-last-scene");
  }
  function activate(index) {
    if (index === active) return;
    const focused = scenes.some(
      (scene, i) => i !== index && scene.contains(document.activeElement),
    );
    active = index;
    root.classList.toggle("is-last-scene",index === scenes.length - 1);
    scenes.forEach((scene, i) => {
      scene.classList.toggle("is-active", i === index);
      scene.inert = i !== index;
      scene.setAttribute("aria-hidden", String(i !== index));
    });
    controls.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    if (focused)
      scenes[index].querySelector("h2").focus({ preventScroll: true });
  }
  function jump(id) {
    if (mobileStory) return mobileStory.jump(id);
    const index = scenes.findIndex((scene) => scene.id === id);
    if (index < 0 || !trigger || !timeline) return false;
    const position =
      trigger.start +
      ((index * 2 + 0.85) / timeline.duration()) *
        (trigger.end - trigger.start);
    // Instant jump avoids passing focus through hidden scenes while smooth scrolling.
    scrollTo({ top: position, behavior: "instant" });
    const heading = scenes[index].querySelector("h2");
    requestAnimationFrame(() => {
      ScrollTrigger.update();
      activate(index);
      heading.focus({ preventScroll: true });
    });
    return true;
  }
  controls.forEach((button) =>
    button.addEventListener("click", () => {
      if (!jump(button.dataset.storyJump))
        document.getElementById(button.dataset.storyJump)?.scrollIntoView();
    }),
  );
  addEventListener("ownpace:story-request", (event) => {
    if (jump(event.detail.id)) event.detail.handled = true;
  });
  function configure() {
    match?.revert();
    reset();
    match = gsap.matchMedia();
    match.add(
      {
        desktop: "(min-width:721px)",
        mobile: "(max-width:720px)",
        allowMotion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        if (
          !context.conditions.allowMotion ||
          document.documentElement.classList.contains("motion-off")
        )
          return;
        if (context.conditions.mobile) {
          mobileStory = initNativeStory({ root, scenes, activate });
          return () => { mobileStory?.destroy(); reset(); };
        }
        // Desktop: pin only when the stage can contain the text. Short landscape screens
        // use the normal-flow alternative instead of cutting content off.
        if (innerHeight < 640) return;
        root.classList.add("is-pinned");
        const stage = root.querySelector(".story-stage");
        gsap.set(scenes, { autoAlpha: 0 });
        gsap.set(scenes[0], { autoAlpha: 1 });
        activate(0);
        timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "ownpace-story",
            trigger: root,
            start: () =>
              `top ${document.querySelector(".site-header").offsetHeight}`,
            end: () =>
              `+=${Math.max(innerHeight, 640) * scenes.length * (context.conditions.mobile ? 0.75 : 0.95)}`,
            pin: stage,
            pinSpacing: true,
            scrub: 0.45,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: () => {
              if (timeline)
                activate(
                  Math.min(
                    scenes.length - 1,
                    Math.max(0, Math.floor((timeline.time() - 0.4) / 2)),
                  ),
                );
            },
          },
        });
        scenes.forEach((scene, i) => {
          const image = scene.querySelector(".scene-image img");
          if (image)
            timeline.fromTo(
              image,
              { scale: 1.01 },
              { scale: 1.075, duration: 2.5 },
              i * 2,
            );
          if (i > 0) {
            timeline.to(scenes[i - 1], { autoAlpha: 0, duration: 0.8 }, i * 2);
            timeline.to(scene, { autoAlpha: 1, duration: 0.8 }, i * 2);
            timeline.fromTo(
              scene.querySelector(".scene-text"),
              { y: 22 },
              { y: 0, duration: 1 },
              i * 2,
            );
          }
        });
        timeline.to({}, { duration: 1.2 }, (scenes.length - 1) * 2 + 0.8);
        trigger = timeline.scrollTrigger;
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return reset;
      },
    );
  }
  try {
    const [g, s] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    gsap = g.gsap;
    ScrollTrigger = s.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    configure();
    let resizeFrame;
    const refresh = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    root.querySelectorAll("img").forEach((image) => {
      if (!image.complete)
        image.addEventListener("load", refresh, { once: true });
    });
    if (document.fonts) document.fonts.ready.then(refresh);
    addEventListener("load", refresh, { once: true });
    addEventListener("ownpace:motionchange", configure);
    // Refresh after an actual short/tall viewport transition too.
    let wasShort = innerHeight < 640;
    addEventListener("resize", () => {
      const short = innerHeight < 640;
      if (innerWidth > 720 && short !== wasShort) {
        wasShort = short;
        configure();
      }
    });
    if (location.hash)
      requestAnimationFrame(() => jump(location.hash.slice(1)));
  } catch (error) {
    match?.revert();
    reset();
    console.warn("OWN PACE: using normal-scroll story fallback.", error);
  }
}
