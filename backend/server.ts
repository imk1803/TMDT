import next from "next";
import { createServer } from "http";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 4000);
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${port}`);
  });
});
