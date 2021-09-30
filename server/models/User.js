const Joi = require("joi");
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      min: 3,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    isBanned: {
      type: Boolean,
      // required: true,
      default: false,
    },
    isMuted: {
      type: Boolean,
      // required: true,
      default: false,
    },
  },
  { versionKey: false, timestamp: true }
);

const joiUserSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().required(),
});

const User = model("User", userSchema);

module.exports = { User, joiUserSchema };
