import END_POINTS from "../../../constants/endpoints";
import {
  addTask,
  editTask,
  register,
  taskDelete,
  tasks,
  taskStatistics4Graph,
  userLogin,
  verifyOTP,
} from "../../services/auth/user-auth-service";

export const registerUser = (userData) => {
  return register(END_POINTS.REGISTER, userData);
};

export const otpVerification = (otpData) => {
  return verifyOTP(END_POINTS.VERIFY_OTP, otpData);
};

export const loginUser = (userData) => {
  return userLogin(END_POINTS.LOGIN, userData);
};

export const taskList = (id, page, limit, search, sort, filters) => {
  return tasks(END_POINTS.TASKS + `/${id}`, page, limit, search, sort, filters);
};

export const createTask = (id, taskData) => {
  return addTask(END_POINTS.TASKS + `/${id}`, taskData);
};
export const updateTask = (id, taskData) => {
  return editTask(END_POINTS.TASKS + `/${id}`, taskData);
};
export const deleteTask = (id) => {
  return taskDelete(END_POINTS.TASKS + `/${id}`);
};
export const taskStatistics = (id) => {
  return taskStatistics4Graph(END_POINTS.TASKS + `/${id}/statistics`);
}
