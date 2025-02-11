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
router.post("/create_group", userAuth.isLogin, taskController.createGroup);
router.get("/fetch_groups", userAuth.isLogin, taskController.getGroups);
router.get("/fetch_group_tasks/:id", userAuth.isLogin, taskController.getGroupTasks);
router.get("/members_list",userAuth.isLogin,taskController.getMembers);
router.post("/add_members/:groupId",userAuth.isLogin,taskController.addMembers);
router.get("/group_invites",userAuth.isLogin,taskController.invites);
router.post("/invite_response",userAuth.isLogin,taskController.respondToInvitation)

module.exports = router;
