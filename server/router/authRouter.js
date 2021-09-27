const express = require("express");

const { authController } = require("../controllers");
const { validation } = require("../middlewares");
const { joiUserSchema } = require("../models/User");

const router = express.Router();

router.post("/auth", validation(joiUserSchema), authController.auth);

module.exports = router;
