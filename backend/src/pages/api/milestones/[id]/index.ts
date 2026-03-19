import { update } from "../../../../controllers/milestone.controller";
import { withErrorHandler } from "../../../../middleware/error";

export default withErrorHandler(async function handler(req, res) {
  if (req.method === "PATCH") {
    await update(req, res);
    return;
  }
  res.status(405).end();
  return;
});
