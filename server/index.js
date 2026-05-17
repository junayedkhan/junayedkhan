const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({
  origin(origin, callback) {
    const allowedOrigin = process.env.CLIENT_URL?.replace(/\/$/, "");
    const isLocalDev = !origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (!allowedOrigin || origin === allowedOrigin || isLocalDev) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));


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

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
