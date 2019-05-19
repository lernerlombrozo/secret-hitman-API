const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true
    },
    messages: [
      {
        message: {
          type: String,
          required: true
        },
        player: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
        time: {
          type: Date,
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema)