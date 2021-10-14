import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { IsDefined, MaxLength, MinLength } from "class-validator";

@Entity("messages")
export class Message {
  constructor(payload: Partial<Message>) {
    Object.assign(this, payload);
  }

  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column()
  @IsDefined()
  userId: string;

  @Column()
  @IsDefined()
  sender: string;

  @Column()
  @IsDefined()
  @MinLength(1)
  @MaxLength(200)
  body: string;

  @Column()
  @IsDefined()
  time: string;

  @CreateDateColumn()
  createdAt: Date;
}
