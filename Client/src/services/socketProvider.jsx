import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import { useEffect, useState } from "react";

let socket;

const useSocket = () => {
  const user = useSelector(selectUser);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      socket = io("http://localhost:4848", {
        query: { userId: user._id },
        withCredentials: true,
      });

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server:", socket.id);
        setIsConnected(true);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error.message);
      });

      socket.on("disconnect", (reason) => {
        console.warn("Socket.IO disconnected:", reason);
        setIsConnected(false);
      });

      // Clean up the socket connection
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return { socket, isConnected };
};

export default useSocket;
