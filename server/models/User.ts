import Joi from "joi";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// import { Schema, model } from "mongoose";

@Entity()
export class User {
  constructor(payload: Partial<User>) {
    Object.assign(this, payload);
  }

  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column({})
  name: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column()
  isBanned: boolean;

  @Column()
  isMuted: boolean;
}

// interface IUser {
//   name: string;
//   password: string;
//   role: string;
//   isBanned: boolean;
//   isMuted: boolean;
// }

// const userSchema = new Schema<IUser>(
//   {
//     name: {
//       type: String,
//       unique: true,
//       required: true,
//       min: 3,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     role: {
//       type: String,
//       required: true,
//     },
//     isBanned: {
//       type: Boolean,
//       // required: true,
//       default: false,
//     },
//     isMuted: {
//       type: Boolean,
//       // required: true,
//       default: false,
//     },
//   },
//   { versionKey: false, timestamps: true }
// );

export const joiUserSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().required(),
});

// export const User = model<IUser>("User", userSchema);
