import { io } from "socket.io-client";

const socket = io("https://task-management-app-yreb.onrender.com", {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO server:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket.IO connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.warn("Socket.IO disconnected:", reason);
});

export default socket;
