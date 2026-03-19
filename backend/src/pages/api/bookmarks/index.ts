import { create, list } from "../../../controllers/bookmark.controller";
import { withErrorHandler } from "../../../middleware/error";

export default withErrorHandler(async function handler(req, res) {
  if (req.method === "POST") {
    await create(req, res);
    return;
  }
  if (req.method === "GET") {
    await list(req, res);
    return;
  }
  res.status(405).end();
  return;
});



