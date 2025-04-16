const express = require("express");
const Task = require("../models/task");
const router = express.Router();

// Get tasks for a user by userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find tasks for the user and sort by createdAt in descending order (most recent first)
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
});

// Add a new task
router.post("/add", async (req, res) => {
  const { userId, task } = req.body;

  try {
    const newTask = new Task({
      userId,
      task,
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Error adding task" });
  }
});

// Delete a task
router.delete("/:userId/:taskId", async (req, res) => {
  const { userId, taskId } = req.params;

  try {
    await Task.findOneAndDelete({ userId, _id: taskId });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting task" });
  }
});

module.exports = router;
