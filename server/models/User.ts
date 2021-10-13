import Joi from "joi";
import { IsDefined, MaxLength, MinLength } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity("users")
export class User {
  constructor(payload: Partial<User>) {
    Object.assign(this, payload);
  }

  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column()
  @IsDefined()
  @MinLength(3)
  @MaxLength(30)
  @Index({ unique: true })
  name: string;

  @Column()
  @IsDefined()
  password: string;

  @Column()
  @IsDefined()
  role: string;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ default: false })
  isMuted: boolean;
}

export const joiUserSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().required(),
});

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

// export const User = model<IUser>("User", userSchema);
