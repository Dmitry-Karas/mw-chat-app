import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validation =
  (schema: ObjectSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: error.message,
      });
    }

    next();
  };
