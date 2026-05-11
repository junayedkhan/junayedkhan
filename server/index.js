const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));


app.get("/api/protected", require("./middleware/authMiddleware"), (req, res) => {
  res.json("You are authenticated!");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});