const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const userAuth = require("../middleware/userAuth");

router.get("/tasks/:id", userAuth.isLogin, taskController.getAllTasks);
router.post("/tasks/:id", userAuth.isLogin, taskController.createTask);
router.put("/tasks/:id", userAuth.isLogin, taskController.updateTask);
router.delete("/tasks/:id", userAuth.isLogin, taskController.deleteTask);
router.get(
  "/tasks/:id/statistics",
  userAuth.isLogin,
  taskController.getTaskStatistics
);

module.exports = router;
