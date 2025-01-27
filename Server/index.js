const express = require("express");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const database = require("./config/DB");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4848;

// Middleware
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
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.options("*", cors()); 

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});
// Routes
app.use("/api/user", userRoutes);
app.use("/api/user", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

database.dbConnect();
