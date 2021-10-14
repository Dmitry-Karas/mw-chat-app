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
