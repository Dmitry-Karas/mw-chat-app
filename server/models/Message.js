const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
  userId: { type: String, required: true },
  sender: { type: String, required: true },
  body: { type: String, required: true },
  time: { type: String, required: true },
});

const Message = model("Message", messageSchema);

module.exports = { Message };
