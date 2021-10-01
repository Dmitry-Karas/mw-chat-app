const jwt = require("jsonwebtoken");
const { User } = require("../../models");

const getCurrentUser = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      res
        .status(403)
        .json({ status: "error", code: 403, message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, verifiedUser) => {
      if (err) {
        throw new Error("Auth error");
      }

      const user = await User.findById(verifiedUser._id);

      if (!user) {
        return res
          .status(404)
          .json({ status: "error", code: 404, message: "Not found" });
      }

      if (user.isBanned) {
        return res.status(403).json({
          status: "error",
          code: 404,
          message: `User "${user.name}" is banned`,
        });
      }

      return res.json(user);
    });
  } catch (error) {
    return res
      .status(400)
      .json({ status: "error", code: 400, message: error.message });
  }
};

module.exports = getCurrentUser;
