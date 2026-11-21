import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, extname, sep } from "node:path";
const root = resolve(import.meta.dirname, ".."),
  dist = resolve(root, "dist");
let building = false,
  queued = false,
  timer;
function build() {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  const child = spawn(process.execPath, ["scripts/build.mjs"], {
    cwd: root,
    stdio: "inherit",
  });
  child.on("exit", () => {
    building = false;
    if (queued) {
      queued = false;
      build();
    }
  });
}
build();
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const target = resolve(
      dist,
      "." + pathname + (pathname.endsWith("/") ? "index.html" : ""),
    );
    if (target !== dist && !target.startsWith(dist + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const content = await readFile(target);
    res.writeHead(200, {
      "Content-Type": mime[extname(target)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found. The initial build may still be running.");
  }
});
const portFlag = process.argv.indexOf("--port");
const port = Number(process.env.PORT || (portFlag >= 0 ? process.argv[portFlag + 1] : 8080));
server.listen(port, "127.0.0.1", () =>
  console.log("Preview: http://localhost:" + port),
);
watch(root, { recursive: true }, (_, name) => {
  if (!name || /^(node_modules|dist|assets[\\/]css)([\\/]|$)/.test(name))
    return;
  if (!/\.(html|scss|js|mjs)$/.test(name)) return;
  clearTimeout(timer);
  timer = setTimeout(build, 200);
});
