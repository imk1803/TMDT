import type { NextApiRequest, NextApiResponse } from "next";
import { createBookmarkSchema } from "../validators/bookmark";
import { createBookmark, listBookmarks, deleteBookmark } from "../services/bookmark.service";
import { sendJson } from "../utils/http";
import { withAuth } from "../middleware/auth";
import { withErrorHandler } from "../middleware/error";

export const create = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const payload = createBookmarkSchema.parse(req.body);
  const bookmark = await createBookmark((req as any).user.id, payload as any);
  sendJson(res, 201, { bookmark });
}));

export const list = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }
  const bookmarks = await listBookmarks((req as any).user.id);
  sendJson(res, 200, { bookmarks });
}));

export const remove = withErrorHandler(withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).end();
    return;
  }
  const id = req.query.id as string;
  const bookmark = await deleteBookmark(id);
  sendJson(res, 200, { bookmark });
}));


