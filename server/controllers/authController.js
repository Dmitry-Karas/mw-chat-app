const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateSuccessToken = (user) => {
  return jwt.sign(user.toJSON(), process.env.JWT_SECRET_KEY, {
    expiresIn: "24h",
  });
};

const auth = async (req, res) => {
  try {
    const { name, password } = req.body;

    let user = await User.findOne({ name }); // Ищем пользователя в базе

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

      const usersCount = await User.count();

      // Если пользователь первый в базе, делаем админом

      const userRole = usersCount === 0 ? "admin" : "user";

      const newUser = new User({
        name,
        password: hashPassword,
        role: userRole,
        isBanned: false,
        isMuted: false,
      });

      user = await newUser.save();
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
  } catch (error) {
    console.log(error.message);

    return res
      .status(400)
      .json({ status: "error", code: 400, message: error.message });
  }
};

module.exports = { auth };
