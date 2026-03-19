import { submit } from "../../../../controllers/milestone.controller";
import { withErrorHandler } from "../../../../middleware/error";

export default withErrorHandler(async function handler(req, res) {
  if (req.method === "POST") {
    await submit(req, res);
    return;
  }
  res.status(405).end();
  return;
});
