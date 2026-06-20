import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname.slice(1);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png"
};

createServer((request, response) => {
  const requestPath = request.url === "/" ? "/index.html" : request.url;
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);

  response.setHeader(
    "Content-Type",
    contentTypes[extname(filePath)] || "application/octet-stream"
  );

  const stream = createReadStream(filePath);
  stream.on("error", () => {
    response.statusCode = 404;
    response.end("Not found");
  });
  stream.pipe(response);
}).listen(8765, "127.0.0.1");
