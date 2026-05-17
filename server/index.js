const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({
  origin(origin, callback) {
    const allowedOrigin = process.env.CLIENT_URL;
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
