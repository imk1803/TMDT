import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).end();
    return;
  }

  const fileUrl = req.query.path as string;
  const filename = req.query.filename as string;

  if (!fileUrl || typeof fileUrl !== 'string' || fileUrl.includes("..")) {
    return res.status(400).end();
  }

  const filePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));

  if (!fs.existsSync(filePath)) {
    return res.status(404).end();
  }

  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename || 'download')}"`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}
