// const { Schema, model } = require("mongoose");
import { Schema, model } from "mongoose";

interface IMessage {
  _id: string;
  userId: string;
  sender: string;
  body: string;
  time: string;
  createdAt: Date;
}

const messageSchema = new Schema(
  {
    userId: { type: String, required: true },
    sender: { type: String, required: true },
    body: { type: String, required: true, maxlength: 200 },
    time: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

export const Message = model<IMessage>("Message", messageSchema);

// module.exports = { Message };
// export default { Message };
