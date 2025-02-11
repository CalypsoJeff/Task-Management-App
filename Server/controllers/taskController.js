const { default: mongoose } = require("mongoose");
const Task = require("../models/taskModel");
const Group = require("../models/groupModel");
const User = require("../models/userModel");


const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Extract query parameters
    const {
      groupId,
      page = 1,
      limit = 10,
      search = "",
      sort = "dueDate:asc",
      filters = "{}",
    } = req.query;
    const baseFilter = groupId ? { groupId } : { userId, groupId: null };

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
      ...baseFilter,
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
  const { title, status, priority, dueDate, groupId } = req.body;
  console.log(req.body, "@@@@@");


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
    const userId = req.user.userId;
    const task = await Task.create({
      title,
      status,
      priority,
      dueDate,
      userId,
      groupId: groupId || null,
    });
    if (groupId) {
      // If the task belongs to a group, emit the event to all group members
      const group = await Group.findById(groupId);
      if (group) {
        group.members.forEach((memberId) => {
          req.io.to(memberId.toString()).emit("taskAdded", task);
        });
      }
    } else {
      // If it's a personal task (not part of a group), emit a global event to the user's room
      req.io.to(userId.toString()).emit("taskAdded", task);
    }
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

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (updatedTask.groupId) {
      // Emit to group members if the task is part of a group
      const group = await Group.findById(updatedTask.groupId);
      if (group) {
        group.members.forEach((memberId) => {
          req.io.to(memberId.toString()).emit("taskUpdated", updatedTask);
        });
      }
    } else {
      // Emit globally for personal tasks
      req.io.to(updatedTask.userId.toString()).emit("taskUpdated", updatedTask);
    }

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
    if (task.groupId) {
      // Emit to group members if the task is part of a group
      const group = await Group.findById(task.groupId);
      if (group) {
        group.members.forEach((memberId) => {
          req.io.to(memberId.toString()).emit("taskDeleted", taskId);
        });
      }
    } else {
      // Emit globally for personal tasks
      req.io.to(task.userId.toString()).emit("taskDeleted", taskId);
    }


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

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;
    console.log("User ID:", userId);
    const group = await Group.create({ name, members: [userId] });
    res.status(201).json({ success: true, group });
  } catch (error) {
    console.error("Error creating a group:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create group" });
  }
}
const getGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groups = await Group.find({ members: userId }).populate('members', 'name email');
    res.status(200).json({ success: true, groups });

  } catch (error) {
    console.error("Error fetching groups:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch groups" });
  }
};
const getGroupTasks = async (req, res) => {
  try {
    const groupId = req.params.id;
    const tasks = await Task.find({ groupId });
    const group = await Group.findById(groupId).populate("members", "name email");
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching group tasks:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch group tasks" });
  }
};
const getMembers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ success: false, message: "users not found or empty" })
    }
    res.status(200).json({ success: true, users });

  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch users" });

  }
}
const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    // Find the group and update the members list
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Add invitations if not already present
    members.forEach((memberId) => {
      if (!group.invitations.some((inv) => inv.userId.toString() === memberId)) {
        group.invitations.push({ userId: memberId });
      }
    });

    await group.save();

    res.status(200).json({ success: true, message: "Invitations sent successfully" });
  } catch (error) {
    console.error("Error inviting members:", error);
    res.status(500).json({ success: false, message: "Failed to invite members" });
  }
};
const invites = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      console.log("id null for user");
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    console.log(userId, "id user");

    // Find groups where the user has a pending invitation
    const groupsWithInvitations = await Group.find({
      "invitations.userId": userId,
      "invitations.status": "Pending",
    }).populate("invitations.userId", "name email");

    // Extract relevant invitation details
    const invitations = groupsWithInvitations
      .map((group) => {
        const invitation = group.invitations.find(
          (inv) => inv.userId._id.toString() === userId.toString() && inv.status === "Pending"
        );

        if (!invitation) return null;

        return {
          _id: invitation._id,
          groupId: group._id,
          groupName: group.name,
          invitedBy: {
            _id: invitation.userId._id,
            name: invitation.userId.name,
            email: invitation.userId.email
          },
          status: invitation.status,
          createdAt: invitation.createdAt,
        };
      })
      .filter((inv) => inv !== null);

    console.log(invitations, "||||||||||");

    res.status(200).json({ success: true, invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch invitations" });
  }
};
const respondToInvitation = async (req, res) => {
  try {
    const { invitationId, status } = req.body;
    const userId = req.user.userId;

    if (!invitationId || !status) {
      return res.status(400).json({ success: false, message: "Invitation ID and status are required" });
    }

    // Find the group containing the invitation
    const group = await Group.findOne({ "invitations._id": invitationId });

    if (!group) {
      return res.status(404).json({ success: false, message: "Group or invitation not found" });
    }

    const invitation = group.invitations.find((inv) => inv._id.toString() === invitationId);

    if (!invitation || invitation.userId.toString() !== userId.toString() || invitation.status !== "Pending") {
      return res.status(404).json({ success: false, message: "Invalid or already processed invitation" });
    }

    // Update the invitation status
    invitation.status = status;

    if (status === "Accepted") {
      if (!group.members.includes(userId)) {
        group.members.push(userId);
      }
    }

    await group.save();

    res.status(200).json({ success: true, message: `Invitation ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error("Error responding to invitation:", error);
    res.status(500).json({ success: false, message: "Server error while responding to invitation" });
  }
};





module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatistics,
  createGroup,
  getGroups,
  getGroupTasks,
  getMembers,
  addMembers,
  invites,
  respondToInvitation,
};
