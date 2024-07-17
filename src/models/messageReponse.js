const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const responseSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageId: {
      type: Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const response = mongoose.model("response", responseSchema);

module.exports = response;
