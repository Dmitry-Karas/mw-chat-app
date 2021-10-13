import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { IsDefined, MaxLength } from "class-validator";

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
  @MaxLength(200)
  body: string;

  @Column()
  @IsDefined()
  time: string;

  @CreateDateColumn()
  createdAt: Date;
}

// import { Schema, model } from "mongoose";

// interface IMessage {
//   _id: string;
//   userId: string;
//   sender: string;
//   body: string;
//   time: string;
//   createdAt: Date;
// }

// const messageSchema = new Schema(
//   {
//     userId: { type: String, required: true },
//     sender: { type: String, required: true },
//     body: { type: String, required: true, maxlength: 200 },
//     time: { type: String, required: true },
//   },
//   {
//     versionKey: false,
//     timestamps: {
//       createdAt: true,
//       updatedAt: false,
//     },
//   }
// );

// export const Message = model<IMessage>("Message", messageSchema);
