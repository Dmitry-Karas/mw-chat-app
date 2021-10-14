import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { getConnection } from "typeorm";

import { User } from "../../models";
import { validate } from "class-validator";

interface IUser {
  name: string;
  password: string;
  role: string;
  isBanned: boolean;
  isMuted: boolean;
}

const connection = getConnection();
const userRepo = connection.getRepository(User);

const generateSuccessToken = ({ ...user }: IUser) => {
  return jwt.sign(user, String(process.env.JWT_SECRET_KEY), {
    expiresIn: "24h",
  });
};

export const auth = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    let user = await userRepo.findOne({ name }); // Ищем пользователя в базе

    // Если пользователь существует, входим в систему

    if (user) {
      const validPassword = bcrypt.compareSync(password, user.password);

      if (!validPassword) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "Incorrect password",
        });
      }
    } else {
      const hashPassword = bcrypt.hashSync(password, 7); // Хешируем пароль
      const usersCount = await userRepo.count();
      const userRole = usersCount === 0 ? "admin" : "user"; // Если пользователь первый в базе, делаем админом
      const newUser = new User({
        name,
        password: hashPassword,
        role: userRole,
        isBanned: false,
        isMuted: false,
      });

      const errors = await validate(newUser);

      if (errors && errors.length > 0) {
        throw new Error(`Validation failed!`);
      }

      user = await userRepo.save(newUser);
    }

    const { _id, role, isBanned, isMuted } = user;
    const token = generateSuccessToken(user);

    if (isBanned) {
      throw new Error("You are banned");
    }

    return res.json({
      _id,
      name,
      role,
      isBanned,
      isMuted,
      token,
    });
  } catch (error: any) {
    console.log(error.message);

    return res
      .status(400)
      .json({ status: "error", code: 400, message: error.message });
  }
};
