import type { NextApiResponse } from "next";

export function sendJson(res: NextApiResponse, status: number, data: unknown) {
  res.status(status).json(data);
}

export function sendError(res: NextApiResponse, status: number, message: string) {
  res.status(status).json({ error: message });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
