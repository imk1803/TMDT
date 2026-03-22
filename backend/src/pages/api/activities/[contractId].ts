import { withAuth } from "../../../middleware/auth";
import { withErrorHandler } from "../../../middleware/error";
import { getActivities } from "../../../controllers/activity.controller";

export default withErrorHandler(withAuth(getActivities));
