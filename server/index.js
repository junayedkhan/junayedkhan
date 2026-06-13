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
    const defaultClientOrigins = [
      "https://junayedkhan.com",
      "https://www.junayedkhan.com",
      "https://junayedkhan000.netlify.app"
    ];
    const configuredClientOrigins = (process.env.CLIENT_URL || "")
      .split(",")
      .map((url) => url.trim().replace(/\/$/, ""))
      .filter(Boolean);
    const allowedOrigins = Array.from(new Set([
      ...defaultClientOrigins,
      ...configuredClientOrigins
    ]));
    const isLocalDev = !origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (allowedOrigins.includes(origin) || isLocalDev) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/site", require("./routes/site"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/blogs", require("./routes/blogs"));

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
const serverAssetsPath = path.join(__dirname, "assets");

const frontendMissingHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Frontend Build Missing</title>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; }
      body {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at 12% 8%, rgba(183, 121, 31, .16), transparent 25%),
          radial-gradient(circle at 88% 18%, rgba(15, 118, 110, .16), transparent 24%),
          linear-gradient(120deg, #fffaf0, #f4f3ee);
        color: #102a2a;
        font-family: Poppins, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 1rem;
      }
      main {
        width: min(100%, 34rem);
        border: 1px solid rgba(255, 255, 255, .82);
        border-radius: 1.5rem;
        background: rgba(255, 250, 240, .82);
        box-shadow: 0 30px 90px rgba(16, 42, 42, .15);
        padding: clamp(1.25rem, 4vw, 2rem);
      }
      .kicker {
        display: inline-flex;
        border: 1px solid rgba(15, 118, 110, .14);
        border-radius: 999px;
        background: rgba(15, 118, 110, .08);
        color: #0f766e;
        padding: .45rem .75rem;
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
      }
      h1 {
        margin: .9rem 0 0;
        font-size: clamp(2rem, 7vw, 3rem);
        line-height: 1.05;
        letter-spacing: 0;
      }
      p {
        margin: .9rem 0 0;
        color: #64748b;
        line-height: 1.75;
      }
      code {
        display: inline-block;
        margin-top: .9rem;
        border-radius: 999px;
        background: #102a2a;
        color: #fffaf0;
        padding: .7rem .9rem;
        font-size: .88rem;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main>
      <span class="kicker">Server Ready</span>
      <h1>Frontend build missing</h1>
      <p>The API server is running, but the production frontend files were not found. Build the client before starting this server in production mode.</p>
      <code>npm run build</code>
    </main>
  </body>
</html>`;

app.use("/server-assets", express.static(serverAssetsPath));
app.use(express.static(clientDistPath));

app.get(/^\/(?!api).*/, (req, res) => {
  if (!fs.existsSync(clientIndexPath)) {
    return res.status(503).type("html").send(frontendMissingHtml);
  }

  res.sendFile(clientIndexPath);
});

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ message: "Upload is too large. Use smaller images/videos or fewer media files." });
  }

  return next(err);
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  validateEnv();
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port", PORT);
  });
};

startServer().catch((error) => {
  console.error("Server failed to start:", error.message);
  process.exit(1);
});
