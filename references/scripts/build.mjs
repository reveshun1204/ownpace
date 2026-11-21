import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { resolve } from "node:path";
import { compile } from "sass";
import { build } from "esbuild";
import { site } from "../assets/js/config/site.js";
const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const pages = ["home", "schedule", "rules", "rank", "report"];
await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "assets/css"), { recursive: true });
await mkdir(resolve(root, "assets/css"), { recursive: true });
for (const page of [...pages, "editorial", "booking-demo"]) {
  const { css } = compile(resolve(root, `assets/scss/${page}.scss`), {
    style: "compressed",
  });
  await writeFile(resolve(root, `assets/css/${page}.css`), css);
  await writeFile(resolve(dist, `assets/css/${page}.css`), css);
}
await build({
  entryPoints: pages.map((page) =>
    resolve(root, `assets/js/pages/${page}/index.js`),
  ),
  outdir: resolve(dist, "assets/js/pages"),
  outbase: resolve(root, "assets/js/pages"),
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  minify: true,
  chunkNames: "shared/[name]-[hash]",
  legalComments: "eof",
});
await cp(resolve(root, "assets/img"), resolve(dist, "assets/img"), {
  recursive: true,
  filter: (p) => !p.endsWith("README.md"),
});
const rawBase = process.env.SITE_URL || site.publicUrl;
let base = null;
if (rawBase) {
  const url = new URL(rawBase);
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("SITE_URL must use HTTP(S)");
  base = url.href.replace(/\/$/, "") + "/";
}
const urls = [];
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
for (const page of pages) {
  const file = page === "home" ? "index.html" : `${page}.html`;
  let html = await readFile(resolve(root, file), "utf8");
  // Version only compiled assets, keeping editable source paths unchanged.
  for (const asset of [`assets/css/${page}.css`, "assets/css/editorial.css", `assets/js/pages/${page}/index.js`]) {
    const bytes = await readFile(resolve(dist, asset));
    const version = createHash("sha256").update(bytes).digest("hex").slice(0,12);
    html = html.replaceAll(`"${asset}"`, `"${asset}?v=${version}"`);
  }
  if (base) {
    const canonical = new URL(page === "home" ? "" : file, base).href;
    urls.push(canonical);
    const image = new URL(
      "assets/img/common/backgrounds/sunset-1536.webp",
      base,
    ).href;
    html = html.replace(
      "</head>",
      `<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(image)}"><meta property="og:image:alt" content="海辺のバスケットコートをイメージしたOWN PACEの背景"></head>`,
    );
  }
  await writeFile(resolve(dist, file), html);
}
await cp(resolve(root, "reservation"), resolve(dist, "reservation"), {recursive:true});
await cp(resolve(root, "admin"), resolve(dist, "admin"), {recursive:true});
await mkdir(resolve(dist, "assets/js/demo"), {recursive:true});
await build({
  entryPoints: ["reservation", "admin"].map(name => resolve(root, `assets/js/demo/${name}.js`)),
  outdir: resolve(dist, "assets/js/demo"), bundle: true, splitting: true,
  format: "esm", platform: "browser", target: ["es2022"], minify: true,
  chunkNames: "shared/[name]-[hash]",
});
for (const page of ["reservation", "admin"]) {
  const path = resolve(dist, page, "index.html");
  let html = await readFile(path, "utf8");
  for (const asset of ["assets/css/booking-demo.css", `assets/js/demo/${page}.js`]) {
    const version = createHash("sha256").update(await readFile(resolve(dist, asset))).digest("hex").slice(0,12);
    html = html.replaceAll(`"../${asset}"`, `"../${asset}?v=${version}"`);
  }
  await writeFile(path, html);
}

await writeFile(resolve(dist, ".nojekyll"), "");
await writeFile(
  resolve(dist, "robots.txt"),
  "User-agent: *\nAllow: /\n" +
    (base ? `Sitemap: ${new URL("sitemap.xml", base).href}\n` : ""),
);
if (base)
  await writeFile(
    resolve(dist, "sitemap.xml"),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      urls.map((url) => `<url><loc>${esc(url)}</loc></url>`).join("") +
      "</urlset>",
  );
console.log("Built HOME + four subpages, SCSS and bundled JS.");
console.log(
  base
    ? "SEO URLs generated for " + base
    : "SITE_URL not configured: canonical and sitemap intentionally omitted.",
);
