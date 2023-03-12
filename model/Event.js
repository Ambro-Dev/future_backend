const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
    createdAt: { type: Date, default: Date.now },
    url: { type: String },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
