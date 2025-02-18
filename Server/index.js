const express = require("express");
const http = require("http");
const session = require("express-session");
const dotenv = require("dotenv");
const MongoStore = require('connect-mongo');
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
    // origin: "http://localhost:5173",

    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});
app.use(
  cors({
    origin: "https://task-management-app-beryl-theta.vercel.app",
    // origin: "http://localhost:5173",
    methods: ["GET", 'POST', 'PUT', "DELETE", 'OPTIONS'],
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
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 3600, // 1 hour expiration time
    }),
    cookie: { secure: false, maxAge: 3600000 },
  })
);
app.options("*", cors());
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    socket.join(userId); // Join the user to their unique room
    console.log(`User ${userId} connected`);
  } else {
    console.log(`Socket ${socket.id} connected without a userId`);
  }

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
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
