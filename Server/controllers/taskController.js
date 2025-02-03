const { default: mongoose } = require("mongoose");
const Task = require("../models/taskModel");

const getAllTasks = async (req, res) => {
  try {
    const userId = req.params.id;

    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "dueDate:asc",
      filters = "{}",
    } = req.query;

    // Parse sort parameter (e.g., "dueDate:asc")
    const [sortField, sortOrder] = sort.split(":");
    const sortObj = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    // Parse filters (assume it's passed as a JSON string from the client)
    const parsedFilters = JSON.parse(filters);
    Object.keys(parsedFilters).forEach((key) => {
      if (!parsedFilters[key]) {
        delete parsedFilters[key];
      }
    });

    // Create a search query (search in "title" field)
    const searchQuery = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    // Combine userId, search query, and filters
    const query = {
      userId,
      ...searchQuery,
      ...parsedFilters,
    };

    // Pagination
    const skip = (page - 1) * limit;
    const totalDocuments = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    // Send response
    res.status(200).json({
      success: true,
      tasks,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

const createTask = async (req, res) => {
  const { title, status, priority, dueDate } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Title must be at least 3 characters long.",
    });
  }
  // Validate due date
  const today = new Date(new Date().setHours(0, 0, 0, 0)); // Start of today
  const selectedDate = new Date(dueDate);
  if (!dueDate || selectedDate < today) {
    return res
      .status(400)
      .json({ success: false, message: "Due date cannot be in the past." });
  }
  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status." });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid priority." });
  }
  try {
    const userId = req.params.id;
    const task = await Task.create({
      title,
      status,
      priority,
      dueDate,
      userId,
    });
    req.io.emit("taskAdded", task);
    res
      .status(201)
      .json({ success: true, message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, status, priority, dueDate } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 3 characters long.",
      });
    }
    const today = new Date(new Date().setHours(0, 0, 0, 0)); // Start of today
    const selectedDate = new Date(dueDate);
    if (!dueDate || selectedDate < today) {
      return res
        .status(400)
        .json({ success: false, message: "Due date cannot be in the past." });
    }
    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }
    if (!["Low", "Medium", "High"].includes(priority)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid priority." });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        status,
        priority,
        dueDate,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Emit event for real-time updates
    req.io.emit("taskUpdated", updatedTask);

    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    // Emit event for real-time updates
    req.io.emit("taskDeleted", taskId);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the task",
    });
  }
};

const getTaskStatistics = async (req, res) => {
  try {
    const { id: userId } = req.params;
    // Convert userId to ObjectId using `new`
    const objectId = new mongoose.Types.ObjectId(userId);
    // Fetch aggregated statistics
    const statistics = await Task.aggregate([
      { $match: { userId: objectId } }, // Match tasks for the specific user
      { $group: { _id: "$status", count: { $sum: 1 } } }, // Group by status
    ]);
    // Format statistics for frontend
    const formattedStats = statistics.map((stat) => ({
      name: stat._id,
      count: stat.count,
    }));
    res.status(200).json({ success: true, statistics: formattedStats });
  } catch (error) {
    console.error("Error fetching task statistics:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch statistics" });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatistics,
};
