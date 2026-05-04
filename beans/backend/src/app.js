const cors = require("cors");
const express = require('express');
const app = express(); 
module.exports = app;
const imageRoutes = require("./routes/image");
app.use("/image", imageRoutes);

const authRoutes = require("./routes/auth");

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes);

  return app;
}

module.exports = { createApp };
