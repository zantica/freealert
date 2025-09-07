// Health check
import { Response, Request } from "express";

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).send({ status: "OK", timestamp: new Date().toISOString() });
};
