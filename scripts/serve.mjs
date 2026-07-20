import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function resolveRequest(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const requestedPath = path.resolve(ROOT, `.${decodedPath}`);

  if (requestedPath !== ROOT && !requestedPath.startsWith(`${ROOT}${path.sep}`)) {
    return null;
  }

  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()) {
    return path.join(requestedPath, "index.html");
  }

  return requestedPath;
}

const server = http.createServer((request, response) => {
  let requestedFile;

  try {
    requestedFile = resolveRequest(new URL(request.url, `http://${HOST}`).pathname);
  } catch {
    requestedFile = null;
  }

  const fileExists = requestedFile && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile();
  const filePath = fileExists ? requestedFile : path.join(ROOT, "404.html");
  const status = fileExists ? 200 : requestedFile ? 404 : 400;
  const contentType = MIME_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";

  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(filePath).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`Department preview available at http://${HOST}:${PORT}/`);
});