const express = require("express");
const http = require("http");
const session = require("express-session");
const dotenv = require("dotenv");
const database = require("./config/DB");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4848;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://task-management-app-beryl-theta.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
app.use(
  cors({
    origin: "https://task-management-app-beryl-theta.vercel.app",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.options("*", cors());
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/api/user", userRoutes);
app.use("/api/user", taskRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

database.dbConnect();
