// const Joi = require("joi");
// const { Schema, model } = require("mongoose");
import Joi from "joi";
import { Schema, model } from "mongoose";

interface IUser {
  name: string;
  password: string;
  role: string;
  isBanned: boolean;
  isMuted: boolean;
}

const userSchema = new Schema<IUser>(
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
  { versionKey: false, timestamps: true }
);

export const joiUserSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().required(),
});

export const User = model<IUser>("User", userSchema);

// export { User, joiUserSchema };

// module.exports = { User, joiUserSchema };
