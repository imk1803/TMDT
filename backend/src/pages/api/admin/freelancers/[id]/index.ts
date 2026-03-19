import { update, remove } from "../../../../../controllers/admin.freelancer.controller";
import { withErrorHandler } from "../../../../../middleware/error";

export default withErrorHandler(async function handler(req, res) {
  if (req.method === "PUT") {
    await update(req, res);
    return;
  }
  if (req.method === "DELETE") {
    await remove(req, res);
    return;
  }
  res.status(405).end();
  return;
});



