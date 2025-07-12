const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    task: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String, // format: "YYYY-MM-DD"
      required: false,
    },
    dueTime: {
      type: String, // format: "HH:mm"
      required: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
