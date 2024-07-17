const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const chatSessionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "New Chat",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("ChatSession", chatSessionSchema);

module.exports = Chat;
