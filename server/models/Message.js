const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    userId: { type: String, required: true },
    sender: { type: String, required: true },
    body: { type: String, required: true, maxlength: 200 },
    time: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const Message = model("Message", messageSchema);

module.exports = { Message };
