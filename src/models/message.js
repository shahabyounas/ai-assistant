const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["system", "user"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const message = mongoose.model("messages", messageSchema);

module.exports = message;
