const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");

const app = express();

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = (process.env.CLIENT_URL || "")
      .split(",")
      .map((url) => url.trim().replace(/\/$/, ""))
      .filter(Boolean);
    const isLocalDev = !origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (!allowedOrigins.length || allowedOrigins.includes(origin) || isLocalDev) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    database: User.db.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/api/protected", require("./middleware/authMiddleware"), (req, res) => {
  res.json("You are authenticated!");
});

const clientDistPath = path.join(__dirname, "..", "client", "dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

app.use(express.static(clientDistPath));

app.get(/^\/(?!api).*/, (req, res) => {
  if (!fs.existsSync(clientIndexPath)) {
    return res.status(503).send("Frontend build missing. Run `npm run build` before starting the server.");
  }

  res.sendFile(clientIndexPath);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  validateEnv();
  await connectDB();

  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
};

startServer().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});
