import multer from "multer";
import path from "path";
import { withAuth } from "../../../middleware/auth";
import { withErrorHandler } from "../../../middleware/error";
import { createResource } from "../../../services/resource.service";
import { sendJson, sendError } from "../../../utils/http";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withErrorHandler(withAuth(async (req: any, res: any) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  
  await new Promise<void>((resolve, reject) => {
    upload.single("file")(req as any, res as any, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") return reject(new Error("File size exceeds 10MB"));
        return reject(err);
      }
      resolve();
    });
  });

  const file = req.file;
  const contractId = req.body.contractId;
  const userId = req.user.id;

  if (!file || !contractId) {
    return sendError(res, 400, "Missing file or contractId");
  }

  const isImage = file.mimetype.startsWith("image/");
  const type = isImage ? "IMAGE" : "FILE";
  const url = `/uploads/${file.filename}`;
  const fileSize = file.size;
  
  const resource = await createResource(userId, {
    contractId,
    type,
    url,
    fileName: file.originalname,
    fileSize,
  });

  return sendJson(res, 201, { resource });
}));
